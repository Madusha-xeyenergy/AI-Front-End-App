"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import type { Interview } from "@/app/services/interviewService";
import {
  InterviewStatusBadge,
  Score,
  toBadgeStatus,
} from "@/components/recruiter/status-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getInitials, type InterviewStatus } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

const filters: ("All" | InterviewStatus)[] = ["All", "Pending", "In Progress", "Completed"];

const focusLabels: Record<Interview["focus"], string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  mixed: "Mixed",
};

// Client Component: it holds the search/filter state. The data comes in as
// props from the Server Component page, which did the fetching.
export function InterviewsTable({ interviews }: { interviews: Interview[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleInterviews = interviews.filter((interview) => {
    const matchesFilter = filter === "All" || toBadgeStatus(interview.status) === filter;
    const matchesQuery =
      !normalizedQuery ||
      interview.candidateId?.name.toLowerCase().includes(normalizedQuery) ||
      interview.jobId?.title.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by candidate or position..."
            className="h-9 pl-9"
            aria-label="Search interviews"
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {filters.map((item) => {
            const count =
              item === "All"
                ? interviews.length
                : interviews.filter((interview) => toBadgeStatus(interview.status) === item).length;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === item
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item}
                <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_0.7fr_24px] gap-4 border-b px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Candidate</span>
          <span>Position</span>
          <span>Status</span>
          <span>Sent</span>
          <span className="text-right">Score</span>
          <span />
        </div>

        {visibleInterviews.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No interviews match your filters.
          </p>
        )}

        {visibleInterviews.map((interview) => (
          <Link
            key={interview._id}
            href={`/interviews/${interview._id}`}
            className="grid grid-cols-[2fr_2fr_1.2fr_1fr_0.7fr_24px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(interview.candidateId?.name ?? "")}</AvatarFallback>
              </Avatar>

              <div>
                <p className="text-sm font-medium">
                  {interview.candidateId?.name ?? "Deleted candidate"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {focusLabels[interview.focus]} · {interview.maxMinutes} min
                </p>
              </div>
            </div>

            <p className="text-sm">{interview.jobId?.title ?? "—"}</p>

            <InterviewStatusBadge status={toBadgeStatus(interview.status)} />

            <p className="text-sm text-muted-foreground">{formatDate(interview.createdAt)}</p>

            <div className="text-right">
              <Score value={interview.evaluation?.score} />
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </>
  );
}
