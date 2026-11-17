// Candidate-side invite lookup, used by the /interview/[token] Server Components.
// Public endpoint: candidates never log in, so no cookie is sent.
// The invite token in the URL is their only access.

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

// What GET /api/invites/:token returns (getInviteService in ai-interview-server).
// Deliberately small: no questions, ids or CV data reach the candidate's browser.
export type Invite = {
  status: "pending" | "in_progress";
  candidateName: string;
  jobTitle: string;
  focus: "technical" | "behavioral" | "mixed";
  maxMinutes: number;
  questionCount: number;
  expiresAt: string;
};

// Either the invite, or why it can't be used (404 invalid, 410 expired/completed/cancelled).
export type InviteResult =
  | { invite: Invite; error?: never }
  | { invite?: never; error: { status: number; message: string } };

const getInviteService = async (token: string): Promise<InviteResult> => {
  const response = await fetch(`${SERVER_URL}/api/invites/${encodeURIComponent(token)}`, {
    cache: "no-store", // status changes (pending → in_progress → completed), never reuse an old answer
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      error: {
        status: response.status,
        message: data?.error ?? "This interview link can't be used right now.",
      },
    };
  }

  return { invite: data.invite as Invite };
};

export { getInviteService };
