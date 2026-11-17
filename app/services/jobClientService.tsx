// Browser-side job calls, used by the Create Job form.
// Separate from jobSevices.tsx because that file uses next/headers (server only).

import type { Job } from "./jobSevices";
import { postJson } from "./postJson";

// What the backend accepts (createJobSchema in ai-interview-server/src/validators/job.validators.ts).
// createBy is not sent: the backend takes it from the logged-in user.
export type CreateJobInput = Pick<Job, "title" | "description" | "type" | "mode" | "status">;

// POST /api/jobs/create
const createJobService = (input: CreateJobInput) =>
  postJson<{ job: Job }>("/api/jobs/create", input);

export { createJobService };
