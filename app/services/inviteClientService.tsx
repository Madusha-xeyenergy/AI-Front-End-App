// Browser-side: called when the candidate clicks "Begin interview".

import { postJson } from "./postJson";

// What the browser needs to join the LiveKit room (startInterviewService in ai-interview-server).
export type InterviewSession = {
  serverUrl: string; // LiveKit's WebSocket URL, e.g. wss://your-project.livekit.cloud
  roomName: string;
  participantToken: string; // short-lived JWT: lets this candidate join this one room only
};

// POST /api/invites/:token/start: the backend sends the AI interviewer into the room,
// marks the interview in_progress, and returns a LiveKit token for the candidate.
const startInterviewService = (token: string) =>
  postJson<InterviewSession>(`/api/invites/${encodeURIComponent(token)}/start`, {});

export { startInterviewService };
