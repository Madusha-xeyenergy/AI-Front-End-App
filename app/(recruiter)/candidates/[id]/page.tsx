import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronRight,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Video,
} from "lucide-react";

import { getCandidateByIdService } from "@/app/services/candidateService";
import { getInterviewsService } from "@/app/services/interviewService";
import {
  InterviewStatusBadge,
  RecommendationBadge,
  Score,
  toBadgeStatus,
  toRecommendationLabel,
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
import { getInitials } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const focusLabels = { technical: "Technical", behavioral: "Behavioral", mixed: "Mixed" };

export async function generateMetadata({
  params,
}: PageProps<"/candidates/[id]">): Promise<Metadata> {
  const { id } = await params;
  // Next reuses the same GET fetch from the page below, so this isn't a second request.
  const candidate = await getCandidateByIdService(id);
  return { title: candidate.name };
}

export default async function CandidateDetailPage({
  params,
}: PageProps<"/candidates/[id]">) {
  const { id } = await params;

  // Shows the 404 page if the candidate doesn't exist (see getCandidateByIdService).
  const [candidate, interviews] = await Promise.all([
    getCandidateByIdService(id),
    getInterviewsService(),
  ]);

  // There's no "interviews for one candidate" endpoint yet, so filter the full list.
  const candidateInterviews = interviews.filter(
    (interview) => interview.candidateId?._id === candidate._id
  );

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/candidates"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      {/* Profile header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {candidate.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Applied for {candidate.jobId?.title ?? "a deleted job"} ·{" "}
              {formatDate(candidate.createdAt)}
            </p>
          </div>
        </div>

        <Link
          href={`/interviews/create?job=${candidate.jobId?._id ?? ""}&candidate=${candidate._id}`}
          className={buttonVariants()}
        >
          <Video />
          Invite to Interview
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Contact & CV */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={Mail} value={candidate.email} />
              <InfoRow icon={Phone} value={candidate.phone} />
              <InfoRow icon={MapPin} value={candidate.location} />
              <InfoRow
                icon={BriefcaseBusiness}
                value={`${candidate.experience} years experience`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CV</CardTitle>
            </CardHeader>

            <CardContent>
              {/* Relative /api URL → goes through the rewrite, so the login cookie is sent. */}
              <a
                href={`/api/candidates/${candidate._id}/resume`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {candidate.resume.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.ceil(candidate.resume.size / 1024)} KB · Open PDF
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>

              {candidate.skills.length > 0 && (
                <>
                  <p className="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interviews */}
        <Card className="self-start">
          <CardHeader>
            <CardTitle>AI Interviews</CardTitle>
            <CardDescription>
              Interview history and AI evaluation results.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {candidateInterviews.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                This candidate hasn&apos;t been invited to an interview yet.
              </p>
            ) : (
              <div className="space-y-3">
                {candidateInterviews.map((interview) => (
                  <Link
                    key={interview._id}
                    href={`/interviews/${interview._id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          {interview.jobId?.title ?? "Deleted job"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {focusLabels[interview.focus]} · {interview.maxMinutes} min ·{" "}
                          {interview.questionCount} questions · Sent{" "}
                          {formatDate(interview.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {interview.evaluation && (
                          <RecommendationBadge
                            recommendation={toRecommendationLabel(
                              interview.evaluation.recommendation
                            )}
                          />
                        )}
                        <InterviewStatusBadge status={toBadgeStatus(interview.status)} />
                        <Score value={interview.evaluation?.score} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {interview.evaluation?.summary && (
                      <p className="mt-3 border-t pt-3 text-sm leading-6 text-muted-foreground">
                        {interview.evaluation.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  );
}
