import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock3,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import {
  getInterviewByIdService,
  type Evaluation,
  type InterviewDetail,
  type QuestionScore,
} from "@/app/services/interviewService";
import { EvaluateButton } from "@/components/recruiter/evaluate-button";
import {
  InterviewStatusBadge,
  RecommendationBadge,
  scoreBarColor,
  scoreColor,
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
import { cn, formatDate } from "@/lib/utils";

const focusLabels = { technical: "Technical", behavioral: "Behavioral", mixed: "Mixed" };

const endReasonLabels = {
  completed: "Finished all questions",
  time_limit: "Reached the time limit",
  candidate_left: "Candidate left early",
};

// Display names for the criterion keys in ai-interview-server/src/config/scoring.ts.
const criterionLabels: Record<string, string> = {
  accuracy: "Technical accuracy",
  depth: "Depth",
  problem_solving: "Problem solving",
  situation: "Situation & task",
  action: "Actions & ownership",
  result: "Result & learning",
  communication: "Communication",
};

const questionTypeLabels = { technical: "Technical", behavioral: "Behavioral" };

export async function generateMetadata({
  params,
}: PageProps<"/interviews/[id]">): Promise<Metadata> {
  const { id } = await params;
  // Next reuses the same GET fetch from the page below, so this isn't a second request.
  const interview = await getInterviewByIdService(id);
  return { title: `${interview.candidateId?.name ?? "Candidate"} – Interview` };
}

export default async function InterviewDetailPage({
  params,
}: PageProps<"/interviews/[id]">) {
  const { id } = await params;
  // Shows the 404 page if the interview doesn't exist (see getInterviewByIdService).
  const interview = await getInterviewByIdService(id);
  const candidate = interview.candidateId;
  const evaluation = interview.evaluation;

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/interviews"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Interviews
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback>{getInitials(candidate?.name ?? "")}</AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {candidate?.name ?? "Deleted candidate"}
              </h1>
              <InterviewStatusBadge status={toBadgeStatus(interview.status)} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {interview.jobId?.title ?? "Deleted job"} · {focusLabels[interview.focus]}{" "}
              interview · {interview.maxMinutes} min · {interview.questionCount} questions
            </p>
          </div>
        </div>

        {candidate && (
          <Link
            href={`/candidates/${candidate._id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            View Candidate
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {evaluation ? <SummaryCard evaluation={evaluation} /> : <StatusCard interview={interview} />}
          {evaluation?.questionScores && evaluation.questionScores.length > 0 && (
            <QuestionScoresCard interview={interview} questionScores={evaluation.questionScores} />
          )}
          {interview.transcript.length > 0 && <TranscriptCard interview={interview} />}
        </div>

        <div className="space-y-6">
          {evaluation && <ScoreCards interviewId={interview._id} evaluation={evaluation} />}
          <DetailsCard interview={interview} />
          <QuestionsCard interview={interview} />
        </div>
      </div>
    </div>
  );
}

// Shown until there's an AI evaluation.
function StatusCard({ interview }: { interview: InterviewDetail }) {
  const content = {
    pending: {
      title: "Waiting for the candidate",
      text: `Created on ${formatDate(interview.createdAt)}. The report will appear here once the candidate completes the interview.`,
    },
    in_progress: {
      title: "Interview in progress",
      text: "The candidate has started the AI interview. The report will appear here once they finish.",
    },
    completed: {
      title: "Interview completed",
      text: "The AI evaluation starts automatically and usually takes under a minute. Refresh the page, or run it now.",
    },
    expired: {
      title: "Invite expired",
      text: "The candidate didn't complete the interview before the link expired.",
    },
    cancelled: {
      title: "Interview cancelled",
      text: "This interview was cancelled.",
    },
  }[interview.status];

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <Clock3 className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">{content.title}</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{content.text}</p>
        {interview.status === "completed" && (
          <div className="mt-4">
            <EvaluateButton interviewId={interview._id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryCard({ evaluation }: { evaluation: Evaluation }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle>AI Summary</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{evaluation.summary}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <BulletList
            title="Strengths"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            dotClass="bg-emerald-500"
            items={evaluation.strengths}
          />
          <BulletList
            title="Areas to probe"
            icon={<TriangleAlert className="h-4 w-4 text-amber-600" />}
            dotClass="bg-amber-500"
            items={evaluation.concerns}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BulletList({
  title,
  icon,
  dotClass,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  dotClass: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", dotClass)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Why each question got its score: the criterion ratings, the candidate's own words, and a short comment.
function QuestionScoresCard({
  interview,
  questionScores,
}: {
  interview: InterviewDetail;
  questionScores: QuestionScore[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Breakdown</CardTitle>
        <CardDescription>
          Each answer is rated 1–5 per criterion against the question&apos;s rubric. Quotes are the
          candidate&apos;s own words from the transcript.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {questionScores.map((result) => {
          const question = interview.questions[result.questionIndex];

          return (
            <div key={result.questionIndex} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5">
                  <p className="text-sm font-medium leading-6">
                    {result.questionIndex + 1}. {question?.text ?? "Question removed"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {question && (
                      <Badge variant="outline">{questionTypeLabels[question.type]}</Badge>
                    )}
                    {question?.topic && <Badge variant="secondary">{question.topic}</Badge>}
                  </div>
                </div>

                <span className={cn("shrink-0 text-lg font-semibold", scoreColor(result.score))}>
                  {result.answered ? `${result.score}%` : "—"}
                </span>
              </div>

              {result.answered ? (
                <div className="mt-3 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
                  {result.criteria.map((criterion) => (
                    <div key={criterion.name} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        {criterionLabels[criterion.name] ?? criterion.name}
                      </span>
                      <span className="font-medium">{criterion.score}/5</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs font-medium text-destructive">Not answered</p>
              )}

              {result.evidence.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {result.evidence.map((quote) => (
                    <blockquote
                      key={quote}
                      className="border-l-2 pl-3 text-xs italic leading-5 text-muted-foreground"
                    >
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  ))}
                </div>
              )}

              {result.comment && <p className="mt-3 text-sm leading-6">{result.comment}</p>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TranscriptCard({ interview }: { interview: InterviewDetail }) {
  // Show each line's time as minutes:seconds since the first line, e.g. "02:15".
  const start = new Date(interview.transcript[0].at).getTime();
  const elapsed = (at: string) => {
    const seconds = Math.max(0, Math.round((new Date(at).getTime() - start) / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
        <CardDescription>
          Conversation between the AI interviewer and the candidate.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {interview.transcript.map((entry, index) => {
            const isAi = entry.role === "assistant";

            return (
              <div key={index} className="flex gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isAi ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isAi ? <Bot className="h-4 w-4" /> : "C"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {isAi ? "AI Interviewer" : "Candidate"}
                    </span>{" "}
                    · {elapsed(entry.at)}
                  </p>
                  <p className="mt-1 text-sm leading-6">{entry.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreCards({ interviewId, evaluation }: { interviewId: string; evaluation: Evaluation }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>Evaluated {formatDate(evaluation.evaluatedAt)}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          <ScoreRing score={evaluation.score} />

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Recommendation:</span>
            <RecommendationBadge
              recommendation={toRecommendationLabel(evaluation.recommendation)}
            />
          </div>

          <div className="mt-4">
            <EvaluateButton interviewId={interviewId} label="Re-evaluate" variant="outline" />
          </div>
        </CardContent>
      </Card>

      {evaluation.competencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competencies</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {evaluation.competencies.map((competency) => (
              <div key={competency.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{competency.name}</span>
                  <span className={cn("font-medium", scoreColor(competency.score))}>
                    {competency.score}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", scoreBarColor(competency.score))}
                    style={{ width: `${competency.score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function DetailsCard({ interview }: { interview: InterviewDetail }) {
  const rows = [
    { label: "Created", value: formatDate(interview.createdAt) },
    { label: "Link expires", value: formatDate(interview.inviteExpiresAt) },
    interview.startedAt && { label: "Started", value: formatDate(interview.startedAt) },
    interview.completedAt && { label: "Completed", value: formatDate(interview.completedAt) },
    interview.endReason && { label: "Ended", value: endReasonLabels[interview.endReason] },
  ].filter((row) => !!row);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
        {/* Only the token's hash is stored, so the link can't be rebuilt here. */}
        <CardDescription>
          The invite link is shown once, when the interview is created.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="text-right font-medium">{row.value}</span>
          </div>
        ))}

        {interview.instructions && (
          <div className="border-t pt-3">
            <p className="mb-1 text-muted-foreground">Instructions</p>
            <p className="leading-6">{interview.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuestionsCard({ interview }: { interview: InterviewDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>
        <CardDescription>What the AI interviewer was asked to cover.</CardDescription>
      </CardHeader>

      <CardContent>
        <ol className="space-y-3">
          {interview.questions.map((question, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="w-5 shrink-0 font-medium text-muted-foreground">{index + 1}.</span>
              <div className="min-w-0 space-y-1.5">
                <p className="leading-6">{question.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{questionTypeLabels[question.type]}</Badge>
                  {question.topic && <Badge variant="secondary">{question.topic}</Badge>}
                </div>

                {/* The standard the answer is scored against. Older interviews have no rubric. */}
                {question.rubric.lookFor.length + question.rubric.redFlags.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground select-none">
                      Scoring rubric
                    </summary>
                    <RubricList title="Look for" items={question.rubric.lookFor} />
                    <RubricList title="Red flags" items={question.rubric.redFlags} />
                  </details>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function RubricList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            score >= 80
              ? "stroke-emerald-500"
              : score >= 65
                ? "stroke-amber-500"
                : "stroke-destructive"
          )}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-semibold", scoreColor(score))}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}
