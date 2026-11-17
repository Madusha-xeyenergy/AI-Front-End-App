import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCandidatesService } from "@/app/services/candidateService";
import { fetchJobs } from "@/app/services/jobSevices";
import { CreateInterviewForm } from "@/components/recruiter/create-interview-form";
import { PageHeader } from "@/components/recruiter/page-header";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Create Interview" };

export default async function CreateInterviewPage({
  searchParams,
}: PageProps<"/interviews/create">) {
  // Optional prefill, e.g. /interviews/create?job=<jobId>&candidate=<candidateId>
  const { job, candidate } = await searchParams;

  // Load the dropdown options on the server, then pass them to the client form.
  const [jobs, candidates] = await Promise.all([fetchJobs(), getCandidatesService()]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Create Interview"
        description="Configure an AI-powered interview for a candidate."
        action={
          <Link
            href="/interviews"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft />
            Back to Interviews
          </Link>
        }
      />

      <CreateInterviewForm
        jobs={jobs}
        candidates={candidates}
        defaultJobId={typeof job === "string" ? job : undefined}
        defaultCandidateId={
          typeof candidate === "string" ? candidate : undefined
        }
      />
    </div>
  );
}
