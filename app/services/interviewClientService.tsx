// Browser-side interview calls, used by the Create Interview form.
// Separate from interviewService.tsx because that file uses next/headers,
// which only works on the server.

import { postJson } from "./postJson";

export type InterviewSettings = {
  jobId: string;
  candidateId: string;
  focus: "technical" | "behavioral" | "mixed";
  maxMinutes: number;
  instructions: string;
};

// Same as QUESTION_TYPES in ai-interview-server/src/models/interview.model.ts.
export type QuestionType = "technical" | "behavioral";

// What a good answer contains; the evaluator scores the candidate's answer against it.
export type Rubric = { lookFor: string[]; redFlags: string[] };

export type GeneratedQuestion = { text: string; topic: string; type: QuestionType; rubric: Rubric };

// POST /api/interviews/questions: the AI writes questions from the job + CV. Nothing is saved.
const generateQuestionsService = (settings: InterviewSettings, questionCount: number) =>
  postJson<{ questions: GeneratedQuestion[]; model: string }>("/api/interviews/questions", {
    ...settings,
    questionCount,
  });

// POST /api/interviews: saves the interview with the final (edited) questions.
const createInterviewService = (
  settings: InterviewSettings,
  questions: GeneratedQuestion[],
  model: string | null
) =>
  postJson<{ inviteUrl: string }>("/api/interviews", {
    ...settings,
    questions,
    // Only send the model id if the questions came from the AI.
    ...(model && { questionsGeneratedBy: model }),
  });

// POST /api/interviews/:id/evaluate: (re-)scores a completed interview. Takes a few seconds.
const evaluateInterviewService = (interviewId: string) =>
  postJson<{ message: string }>(`/api/interviews/${encodeURIComponent(interviewId)}/evaluate`, {});

export { generateQuestionsService, createInterviewService, evaluateInterviewService };
