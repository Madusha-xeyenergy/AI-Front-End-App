import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  MapPin,
  Video,
} from "lucide-react";

import { PageHeader } from "@/components/recruiter/page-header";
import {
  InterviewStatusBadge,
  JobStatusBadge,
  Score,
} from "@/components/recruiter/status-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCandidatesForJob,
  getInitials,
  getJob,
  getLatestInterviewForCandidate,
} from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getJob(id)?.title ?? "Job not found" };
}

export default async function JobDetailPage({
  params,
}: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) notFound();

  const pipeline = getCandidatesForJob(job.id).map((candidate) => ({
    candidate,
    interview: getLatestInterviewForCandidate(candidate.id),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <PageHeader
        title={job.title}
        description={`${job.department} · ${job.employmentType}`}
        action={
          <Link
            href={`/interviews/create?job=${job.id}`}
            className={buttonVariants()}
          >
            <Video />
            Create Interview
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
            <CardDescription>
              {pipeline.length} candidate{pipeline.length === 1 ? "" : "s"}{" "}
              applied for this position.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {pipeline.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No candidates yet.
              </p>
            ) : (
              <div className="divide-y">
                {pipeline.map(({ candidate, interview }) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="-mx-2 flex items-center justify-between gap-4 rounded-md px-2 py-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {candidate.experienceYears} yrs experience · Applied{" "}
                          {candidate.appliedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      {interview ? (
                        <InterviewStatusBadge status={interview.status} />
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Not invited
                        </Badge>
                      )}

                      <div className="w-10 text-right">
                        <Score value={interview?.score} />
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Job Details</CardTitle>
                <JobStatusBadge status={job.status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <DetailRow icon={BriefcaseBusiness} label={job.department} />
              <DetailRow icon={MapPin} label={job.location} />
              <DetailRow icon={CalendarDays} label={`Posted ${job.createdAt}`} />

              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </p>
                <p className="leading-6 text-muted-foreground">
                  {job.description}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Required skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}
