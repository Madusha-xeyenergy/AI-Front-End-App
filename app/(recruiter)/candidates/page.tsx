import type { Metadata } from "next";

import { getCandidatesService } from "@/app/services/candidateService";
import { getInterviewsService } from "@/app/services/interviewService";
import { fetchJobs } from "@/app/services/jobSevices";
import { CandidatesTable } from "@/components/recruiter/candidates-table";
import { PageHeader } from "@/components/recruiter/page-header";

export const metadata: Metadata = { title: "Candidates" };

// Server Component: fetches on the server, then hands the data to the client table.
export default async function CandidatesPage() {
  // Three independent requests: run them at the same time, not one after another.
  const [candidates, interviews, jobs] = await Promise.all([
    getCandidatesService(),
    getInterviewsService(),
    fetchJobs(),
  ]);

  return (
    <div>
      <PageHeader
        title="Candidates"
        description="View candidates and their interview results."
      />

      <CandidatesTable candidates={candidates} interviews={interviews} jobs={jobs} />
    </div>
  );
}
