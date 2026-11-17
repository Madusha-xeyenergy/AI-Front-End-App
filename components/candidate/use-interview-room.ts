"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type LocalVideoTrack,
  type Participant,
  type RemoteTrack,
  Room,
  RoomEvent,
  Track,
  TrackEvent,
  createLocalScreenTracks,
  createLocalVideoTrack,
} from "livekit-client";

import { startInterviewService } from "@/app/services/inviteClientService";

// Names the voice agent uses inside the room (constants.js in @livekit/agents).
const TRANSCRIPTION_TOPIC = "lk.transcription"; // text stream topic for live transcripts
const SEGMENT_ID_ATTRIBUTE = "lk.segment_id"; // groups the pieces of one spoken line
const AGENT_STATE_ATTRIBUTE = "lk.agent.state"; // set on the agent participant

export type ConnectionStatus = "idle" | "connecting" | "connected" | "ended" | "error";
export type AgentState = "connecting" | "initializing" | "listening" | "thinking" | "speaking";
export type TranscriptLine = { id: string; speaker: "ai" | "candidate"; text: string };

/**
 * The candidate's entire screen. A single window or tab isn't accepted: the interview is
 * recorded so the hiring team can check for cheating, and another app could then be used unseen.
 * Must run from a click (browsers only allow screen capture after a user gesture).
 */
async function captureScreen() {
  const tracks = await createLocalScreenTracks({
    audio: false,
    video: { displaySurface: "monitor" }, // offer "Entire screen" first
    surfaceSwitching: "exclude", // no switching to a window halfway through
    contentHint: "text", // keep code and text readable in the recording
  });
  const screen = tracks.find((track) => track.kind === Track.Kind.Video) as LocalVideoTrack;
  // Firefox doesn't report displaySurface; it only offers windows and screens anyway.
  const surface = (screen.mediaStreamTrack.getSettings() as { displaySurface?: string })
    .displaySurface;
  if (surface && surface !== "monitor") {
    tracks.forEach((track) => track.stop());
    throw new Error("Please share your entire screen, not a window or a browser tab.");
  }
  return screen;
}

// Turns a refused permission into something the candidate can act on.
function mediaErrorMessage(err: unknown, device: "camera" | "screen") {
  if (err instanceof DOMException && err.name === "NotAllowedError") {
    return device === "camera"
      ? "Camera access is required for this interview. Allow it from the address bar (lock icon) and try again."
      : "Screen sharing is required for this interview. Click the button again and share your entire screen.";
  }
  if (err instanceof DOMException && err.name === "NotFoundError" && device === "camera") {
    return "No camera was found. Connect a camera and try again.";
  }
  return err instanceof Error ? err.message : `Couldn't start the ${device}`;
}

/**
 * Joins the candidate to the LiveKit room where the AI interviewer is waiting.
 *
 * 1. The candidate shares their entire screen and turns on the camera. Both are required,
 *    since the interview is recorded; if either is refused, the agent is never sent in.
 * 2. POST /api/invites/:token/start → { serverUrl, participantToken }
 * 3. room.connect(serverUrl, participantToken) opens a WebSocket to LiveKit
 *    (signalling) and a WebRTC connection (the actual audio and video).
 * 4. Microphone, camera and screen are published; the agent's voice track is played.
 * 5. Live transcripts and the agent's state arrive over the same connection.
 */
export function useInterviewRoom(token: string) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>("connecting");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [candidateSpeaking, setCandidateSpeaking] = useState(false);
  // Browsers block audio that starts without a click; if that happens, show a button.
  const [audioBlocked, setAudioBlocked] = useState(false);
  // For the candidate's own preview. Screen sharing can be stopped from the browser's
  // "Stop sharing" bar; then screenShared turns false and the page asks them to share again.
  const [cameraTrack, setCameraTrack] = useState<LocalVideoTrack | null>(null);
  const [screenShared, setScreenShared] = useState(false);

  const roomRef = useRef<Room | null>(null);

  // Publishes the screen and notices when the candidate stops sharing it.
  // (LiveKit unpublishes an ended screen share by itself.)
  const publishScreen = useCallback(async (room: Room, screen: LocalVideoTrack) => {
    screen.once(TrackEvent.Ended, () => setScreenShared(false));
    await room.localParticipant.publishTrack(screen);
    setScreenShared(true);
  }, []);

  // Adds a line, or updates it if the same segment id arrives again
  // (the candidate's words are re-sent as the speech recogniser refines them).
  const upsertLine = useCallback((line: TranscriptLine) => {
    setTranscript((current) => {
      const index = current.findIndex((item) => item.id === line.id);
      if (index === -1) return [...current, line];
      const next = [...current];
      next[index] = line;
      return next;
    });
  }, []);

  // Must be called from a click: browsers only allow audio playback after a user gesture.
  const start = useCallback(async () => {
    if (roomRef.current) return;
    setStatus("connecting");
    setError(null);

    let screen: LocalVideoTrack | undefined;
    let camera: LocalVideoTrack | undefined;
    try {
      // 1. Screen first, while the click still counts as a user gesture; the camera
      // permission prompt in between would use it up.
      try {
        screen = await captureScreen();
      } catch (err) {
        throw new Error(mediaErrorMessage(err, "screen"));
      }
      try {
        camera = await createLocalVideoTrack();
      } catch (err) {
        throw new Error(mediaErrorMessage(err, "camera"));
      }

      // 2. Ask our backend to dispatch the agent and give us a LiveKit token.
      const { serverUrl, participantToken } = await startInterviewService(token);

      const room = new Room();
      roomRef.current = room;

      // The agent's voice: attach() creates an <audio> element (no controls, so
      // invisible) that plays the track. It's removed again on unsubscribe.
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          document.body.appendChild(track.attach());
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((element) => element.remove());
      });

      // The agent publishes its state (listening / thinking / speaking) as a participant attribute.
      room.on(RoomEvent.ParticipantAttributesChanged, (changed, participant: Participant) => {
        const state = changed[AGENT_STATE_ATTRIBUTE];
        if (participant.isAgent && state) setAgentState(state as AgentState);
      });

      // Drives the "you're speaking" ring around the orb.
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        setCandidateSpeaking(speakers.some((speaker) => speaker.isLocal));
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        setAudioBlocked(!room.canPlaybackAudio);
      });

      // The agent leaves the room when the interview ends (it calls ctx.shutdown()).
      room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
        if (participant.isAgent) room.disconnect();
      });

      // disconnect() also stops the published camera and screen tracks.
      room.on(RoomEvent.Disconnected, () => {
        roomRef.current = null;
        setCameraTrack(null);
        setScreenShared(false);
        setStatus("ended");
      });

      // Live transcripts for both sides. The agent sends them as text streams;
      // for the candidate's speech it sends them on the candidate's behalf.
      room.registerTextStreamHandler(TRANSCRIPTION_TOPIC, async (reader, participantInfo) => {
        const id = reader.info.attributes?.[SEGMENT_ID_ATTRIBUTE] ?? reader.info.id;
        const speaker =
          participantInfo.identity === room.localParticipant.identity ? "candidate" : "ai";

        // Words arrive in chunks while the agent speaks; show them as they come.
        let text = "";
        for await (const chunk of reader) {
          text += chunk;
          upsertLine({ id, speaker, text });
        }
      });

      // 3. Open the connection: a WebSocket for signalling, WebRTC for audio and video.
      await room.connect(serverUrl, participantToken);

      // 4. Publish the microphone so the agent can hear the candidate, and the camera and
      // screen so the interview recording (made by LiveKit Egress) shows them.
      await room.localParticipant.setMicrophoneEnabled(true);
      await room.localParticipant.publishTrack(camera);
      setCameraTrack(camera);
      await publishScreen(room, screen);
      await room.startAudio().catch(() => setAudioBlocked(true));

      setStatus("connected");
    } catch (err) {
      roomRef.current?.disconnect();
      roomRef.current = null;
      // not stopped by disconnect() if we failed before publishing them
      screen?.stop();
      camera?.stop();
      setCameraTrack(null);
      setScreenShared(false);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't connect to the interview");
    }
  }, [token, upsertLine, publishScreen]);

  // After the candidate stopped sharing. Must be called from a click, like start().
  const shareScreenAgain = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      await publishScreen(room, await captureScreen());
      setError(null);
    } catch (err) {
      setError(mediaErrorMessage(err, "screen"));
    }
  }, [publishScreen]);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }, []);

  const enableAudio = useCallback(async () => {
    await roomRef.current?.startAudio();
    setAudioBlocked(false);
  }, []);

  // The candidate clicks "End". The agent notices they left and sends the transcript.
  const leave = useCallback(() => {
    roomRef.current?.disconnect();
  }, []);

  // Leaving the page (or closing the tab) disconnects too.
  useEffect(() => () => {
    roomRef.current?.disconnect();
  }, []);

  return {
    status,
    error,
    agentState,
    transcript,
    micEnabled,
    candidateSpeaking,
    audioBlocked,
    cameraTrack,
    screenShared,
    start,
    shareScreenAgain,
    toggleMic,
    enableAudio,
    leave,
  };
}
