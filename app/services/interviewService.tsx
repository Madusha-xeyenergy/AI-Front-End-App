import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import type { QuestionType, Rubric } from "./interviewClientService";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

export type Recommendation = "strong_hire" | "hire" | "maybe" | "no_hire";

// One per question. The AI rates each criterion 1–5 and quotes the candidate;
// the backend computes `score` (0–100) from the ratings.
export type QuestionScore = {
  questionIndex: number;
  answered: boolean;
  criteria: { name: string; score: number }[];
  score: number;
  evidence: string[];
  comment: string;
};

// Written by the backend after the interview (ai-interview-server/src/config/scoring.ts).
export type Evaluation = {
  score: number;
  recommendation: Recommendation;
  summary: string;
  // Missing on evaluations made before rubric scoring existed.
  questionScores?: QuestionScore[];
  competencies: { name: string; score: number }[];
  strengths: string[];
  concerns: string[];
  evaluatedAt: string;
};

// Same fields as ai-interview-server/src/models/interview.model.ts (only what the list returns)
export type Interview = {
  _id: string;
  status: "pending" | "in_progress" | "completed" | "expired" | "cancelled";
  focus: "technical" | "behavioral" | "mixed";
  maxMinutes: number;
  questionCount: number;
  createdAt: string;
  // The backend fills these in from the Candidate and Job collections (populate).
  // null if the candidate/job was deleted after the interview was created.
  candidateId: { _id: string; name: string; email: string } | null;
  jobId: { _id: string; title: string } | null;
  // Only present once the AI has evaluated the transcript.
  evaluation?: Evaluation;
};

// The detail endpoint also returns the questions and the transcript.
export type InterviewDetail = Interview & {
  instructions: string;
  questions: { text: string; topic: string; type: QuestionType; rubric: Rubric }[];
  // "assistant" = the AI interviewer, "user" = the candidate
  transcript: { role: "assistant" | "user"; text: string; at: string }[];
  inviteExpiresAt: string;
  startedAt?: string;
  completedAt?: string;
  endReason?: "completed" | "time_limit" | "candidate_left";
};

const getInterviewsService = async (): Promise<Interview[]> => {
  // Runs on the Next server, so forward the browser's login cookie to the backend.
  const cookieStore = await cookies();

  const response = await fetch(`${SERVER_URL}/api/interviews`, {
    headers: { Cookie: cookieStore.toString() },
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch interviews: ${response.status} ${response.statusText}`);
  }

  const data: { interviews: Interview[] } = await response.json();
  return data.interviews;
};

const getInterviewByIdService = async (id: string): Promise<InterviewDetail> => {
  const cookieStore = await cookies();

  const response = await fetch(`${SERVER_URL}/api/interviews/${encodeURIComponent(id)}`, {
    headers: { Cookie: cookieStore.toString() },
  });

  if (response.status === 401) {
    redirect("/login");
  }

  // 404 = no such interview, 422 = the id in the URL isn't a valid id. Both: show the 404 page.
  if (response.status === 404 || response.status === 422) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch interview: ${response.status} ${response.statusText}`);
  }

  const data: { interview: InterviewDetail } = await response.json();
  return data.interview;
};

export { getInterviewsService, getInterviewByIdService };
