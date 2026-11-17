import { CheckCircle2, CircleDashed, Clock3, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  InterviewStatus,
  JobStatus,
  Recommendation,
} from "@/lib/mock-data";

// The API sends lowercase codes; the badge uses display labels.
// "cancelled" has no badge of its own yet, so it shows like "Expired".
const apiStatusToBadge: Record<string, InterviewStatus> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Expired",
};

export function toBadgeStatus(apiStatus: string): InterviewStatus {
  return apiStatusToBadge[apiStatus] ?? "Pending";
}

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  if (status === "Completed") {
    return (
      <Badge
        variant="secondary"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      >
        <CheckCircle2 />
        Completed
      </Badge>
    );
  }

  if (status === "In Progress") {
    return (
      <Badge
        variant="secondary"
        className="bg-amber-500/10 text-amber-700 dark:text-amber-400"
      >
        <Clock3 />
        In Progress
      </Badge>
    );
  }

  if (status === "Expired") {
    return (
      <Badge variant="destructive">
        <XCircle />
        Expired
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      <CircleDashed />
      Pending
    </Badge>
  );
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge
      variant={status === "Active" ? "secondary" : "outline"}
      className={cn(status !== "Active" && "text-muted-foreground")}
    >
      {status}
    </Badge>
  );
}

// Same idea as toBadgeStatus: API code → display label.
const apiRecommendationToLabel: Record<string, Recommendation> = {
  strong_hire: "Strong Hire",
  hire: "Hire",
  maybe: "Maybe",
  no_hire: "No Hire",
};

export function toRecommendationLabel(apiRecommendation: string): Recommendation {
  return apiRecommendationToLabel[apiRecommendation] ?? "Maybe";
}

const recommendationStyles: Record<Recommendation, string> = {
  "Strong Hire": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Hire: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Maybe: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "No Hire": "bg-destructive/10 text-destructive",
};

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <Badge
      variant="secondary"
      className={recommendationStyles[recommendation]}
    >
      {recommendation}
    </Badge>
  );
}

export function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 65) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

export function scoreBarColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-amber-500";
  return "bg-destructive";
}

export function Score({ value }: { value?: number }) {
  if (value === undefined) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <span className={cn("text-sm font-semibold", scoreColor(value))}>
      {value}%
    </span>
  );
}
