import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, MapPin, Plus } from "lucide-react";

import { fetchJobs, type Job } from "@/app/services/jobSevices";
import { PageHeader } from "@/components/recruiter/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Jobs" };

// The API sends codes like "full_time"; these turn them into display text.
const statusLabels: Record<Job["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

const typeLabels: Record<Job["type"], string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
};

const modeLabels: Record<Job["mode"], string> = {
  remote: "Remote",
  on_site: "On-site",
  hybrid: "Hybrid",
};

// An async Server Component: it fetches on the server, then sends finished HTML.
export default async function JobsPage() {
  const jobs = await fetchJobs();

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Manage your open positions and candidate pipelines."
        action={
          <Link href="/jobs/new" className={buttonVariants()}>
            <Plus />
            Create Job
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No jobs yet. Create your first job to get started.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job._id} className="transition-shadow hover:shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <Badge
                    variant={job.status === "open" ? "secondary" : "outline"}
                    className={cn(job.status !== "open" && "text-muted-foreground")}
                  >
                    {statusLabels[job.status]}
                  </Badge>
                </div>

                <CardTitle className="pt-2">{job.title}</CardTitle>

                <p className="text-sm text-muted-foreground">{typeLabels[job.type]}</p>

                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {modeLabels[job.mode]}
                </p>
              </CardHeader>

              <CardContent className="mt-auto">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {job.description}
                </p>

                <Link
                  href={`/jobs/${job._id}`}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}
                >
                  View Job
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
