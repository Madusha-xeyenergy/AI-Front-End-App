import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getInterviewsService } from "@/app/services/interviewService";
import { InterviewsTable } from "@/components/recruiter/interviews-table";
import { PageHeader } from "@/components/recruiter/page-header";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Interviews" };

// Server Component: fetches on the server, then hands the data to the client table.
export default async function InterviewsPage() {
  const interviews = await getInterviewsService();

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Track and review AI-powered candidate interviews."
        action={
          <Link href="/interviews/create" className={buttonVariants()}>
            <Plus />
            Create Interview
          </Link>
        }
      />

      <InterviewsTable interviews={interviews} />
    </div>
  );
}
