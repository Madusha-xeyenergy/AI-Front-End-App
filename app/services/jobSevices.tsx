import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Next.js loads .env by itself, so dotenv isn't needed.
// No NEXT_PUBLIC_ prefix, so this value only exists on the server. That's fine:
// this file is only used by Server Components (next/headers only works there).
const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

// Same fields as ai-interview-server/src/models/job.models.ts
export type Job = {
  _id: string;
  title: string;
  description: string;
  status: "open" | "closed" | "in_progress";
  type: "full_time" | "part_time" | "contract";
  mode: "remote" | "on_site" | "hybrid";
  createBy: string;
};

const fetchJobs = async (): Promise<Job[]> => {
  // This runs on the Next server, not in the browser, so the browser's login
  // cookie isn't attached automatically. Forward it so the backend's
  // requireAuth middleware knows who is asking.
  const cookieStore = await cookies();

  // Backticks (not double quotes), otherwise ${SERVER_URL} is not replaced.
  const response = await fetch(`${SERVER_URL}/api/jobs`, {
    headers: { Cookie: cookieStore.toString() },
  });

  // Not logged in (or the session expired): send the user to the login page.
  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
  }

  // The backend responds with { message, jobs }, not a plain array.
  const data: { jobs: Job[] } = await response.json();
  return data.jobs;
};

export { fetchJobs };
