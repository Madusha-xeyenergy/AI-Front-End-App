import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

// Next.js loads .env by itself, so dotenv isn't needed.
const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

// Same fields as ai-interview-server/src/models/candidate.model.ts
export type Candidate = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number; // years
  skills: string[];
  // The backend fills in the job title (populate). null if the job was deleted.
  jobId: { _id: string; title: string } | null;
  resume: { filename: string; size: number };
  createdAt: string;
};

const getCandidatesService = async (): Promise<Candidate[]> => {
  // Runs on the Next server, so forward the browser's login cookie to the backend.
  const cookieStore = await cookies();

  const response = await fetch(`${SERVER_URL}/api/candidates`, {
    headers: { Cookie: cookieStore.toString() },
  });

  // Not logged in (or the session expired): send the user to the login page.
  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.status} ${response.statusText}`);
  }

  const data: { candidates: Candidate[] } = await response.json();
  return data.candidates;
};

const getCandidateByIdService = async (id: string): Promise<Candidate> => {
  const cookieStore = await cookies();

  const response = await fetch(`${SERVER_URL}/api/candidates/${encodeURIComponent(id)}`, {
    headers: { Cookie: cookieStore.toString() },
  });

  if (response.status === 401) {
    redirect("/login");
  }

  // 404 = no such candidate, 422 = the id in the URL isn't a valid id. Both: show the 404 page.
  if (response.status === 404 || response.status === 422) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch candidate: ${response.status} ${response.statusText}`);
  }

  const data: { candidate: Candidate } = await response.json();
  return data.candidate;
};

export { getCandidatesService, getCandidateByIdService };
