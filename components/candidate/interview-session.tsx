"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LocalVideoTrack } from "livekit-client";
import {
  Bot,
  Clock3,
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Volume2,
} from "lucide-react";

import {
  type AgentState,
  useInterviewRoom,
} from "@/components/candidate/use-interview-room";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  token: string;
  candidateName: string;
  jobTitle: string;
  maxMinutes: number;
  questionCount: number;
};

// Step 3 of 3: the live voice interview.
export function InterviewSession({
  token,
  candidateName,
  jobTitle,
  maxMinutes,
  questionCount,
}: Props) {
  const router = useRouter();
  const room = useInterviewRoom(token);

  const [confirmEnd, setConfirmEnd] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(maxMinutes * 60);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const connected = room.status === "connected";

  // Countdown for the candidate. Display only: the agent enforces the real time limit.
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(
      () => setSecondsLeft((seconds) => Math.max(0, seconds - 1)),
      1000
    );
    return () => clearInterval(interval);
  }, [connected]);

  // When the room closes (the agent finished, or the candidate clicked End), say thanks.
  useEffect(() => {
    if (room.status === "ended") router.push(`/interview/${token}/complete`);
  }, [room.status, router, token]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.transcript]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="border-b bg-background px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{jobTitle}</p>
            <p className="text-xs text-muted-foreground">{questionCount} questions</p>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm tabular-nums",
              connected && secondsLeft < 60 && "border-destructive/40 text-destructive"
            )}
            aria-label="Time remaining"
          >
            <Clock3 className="h-3.5 w-3.5" />
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-6 lg:grid-cols-[1fr_340px]">
        {/* Interview stage */}
        <div className="relative flex flex-col rounded-xl bg-card ring-1 ring-foreground/10">
          {room.cameraTrack && <CameraPreview track={room.cameraTrack} />}

          {connected && !room.screenShared && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span>
                You stopped sharing your screen. Screen sharing is required for this
                interview and is part of the recording.
              </span>
              <Button variant="destructive" size="sm" onClick={room.shareScreenAgain}>
                <MonitorUp />
                Share screen again
              </Button>
            </div>
          )}

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <AiOrb
              speaking={connected && room.agentState === "speaking"}
              listening={connected && room.candidateSpeaking}
            />

            <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {connected ? agentStateLabel(room.agentState) : "AI Interviewer"}
            </p>

            {room.status === "idle" || room.status === "error" ? (
              <div className="mt-3 max-w-md">
                <h1 className="text-xl font-semibold">
                  Ready when you are, {candidateName.split(" ")[0]}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  The interviewer will greet you and ask {questionCount} questions.
                  Just answer out loud. When you stop talking, the interviewer
                  will respond.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This interview is recorded. When you click Begin, share your{" "}
                  <span className="font-medium text-foreground">entire screen</span>{" "}
                  and allow your camera. Both stay on until the end.
                </p>

                {room.error && (
                  <p className="mt-4 text-sm text-destructive">{room.error}</p>
                )}

                {/* This click also unlocks audio playback in the browser. */}
                <Button size="lg" className="mt-6 h-10 px-6" onClick={room.start}>
                  {room.status === "error" ? "Try again" : "Begin interview"}
                </Button>
              </div>
            ) : room.status === "connecting" ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting to your interviewer…
              </p>
            ) : connected && room.error ? (
              <p className="mt-3 max-w-md text-sm text-destructive">{room.error}</p>
            ) : (
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                {room.agentState === "listening"
                  ? "Take your time. The interviewer is listening."
                  : "Speak naturally, as you would with a person."}
              </p>
            )}

            {room.audioBlocked && (
              <Button variant="outline" className="mt-4" onClick={room.enableAudio}>
                <Volume2 />
                Click to hear the interviewer
              </Button>
            )}
          </div>

          {/* Controls */}
          {connected && (
            <div className="flex flex-wrap items-center justify-center gap-2 border-t p-4">
              <Button
                variant="outline"
                size="lg"
                onClick={room.toggleMic}
                className={cn(!room.micEnabled && "text-destructive")}
              >
                {room.micEnabled ? <Mic /> : <MicOff />}
                {room.micEnabled ? "Mute" : "Unmute"}
              </Button>

              {confirmEnd ? (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-2 py-1">
                  <span className="text-sm text-destructive">End the interview now?</span>
                  <Button variant="destructive" size="sm" onClick={room.leave}>
                    Yes, end
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" size="lg" onClick={() => setConfirmEnd(true)}>
                  <PhoneOff />
                  End
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Live transcript */}
        <div className="flex max-h-[calc(100vh-10rem)] flex-col rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">Transcript</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {room.transcript.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                The conversation will appear here.
              </p>
            )}

            {room.transcript.map((line) => (
              <div
                key={line.id}
                className={cn("flex gap-2", line.speaker === "candidate" && "flex-row-reverse")}
              >
                {line.speaker === "ai" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <p
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-5",
                    line.speaker === "ai" ? "bg-muted" : "bg-primary text-primary-foreground"
                  )}
                >
                  {line.text}
                </p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AiOrb({ speaking, listening }: { speaking: boolean; listening: boolean }) {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      {speaking && (
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
      )}
      {listening && (
        <span className="absolute inset-0 scale-110 rounded-full bg-emerald-500/20 transition-transform" />
      )}
      <div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-400 text-primary-foreground shadow-lg transition-transform",
          speaking && "scale-105"
        )}
      >
        <Bot className="h-10 w-10" />
      </div>
    </div>
  );
}

// The candidate's own camera, mirrored like a mirror. attach() wires the track to the <video>.
function CameraPreview({ track }: { track: LocalVideoTrack }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    track.attach(video);
    return () => {
      track.detach(video);
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      aria-label="Your camera"
      className="absolute right-4 bottom-20 z-10 aspect-video w-40 -scale-x-100 rounded-lg bg-muted object-cover shadow-md ring-1 ring-foreground/10"
    />
  );
}

function agentStateLabel(state: AgentState) {
  switch (state) {
    case "connecting":
    case "initializing":
      return "Interviewer is joining…";
    case "listening":
      return "Your turn: listening";
    case "thinking":
      return "Interviewer is thinking";
    case "speaking":
      return "Interviewer is speaking";
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
