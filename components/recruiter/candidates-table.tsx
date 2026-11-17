"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import type { Candidate } from "@/app/services/candidateService";
import type { Interview } from "@/app/services/interviewService";
import type { Job } from "@/app/services/jobSevices";
import {
  InterviewStatusBadge,
  Score,
  toBadgeStatus,
} from "@/components/recruiter/status-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { getInitials } from "@/lib/mock-data";

type Props = {
  candidates: Candidate[];
  interviews: Interview[];
  jobs: Job[];
};

// Client Component: it holds the search/filter state. The data comes in as
// props from the Server Component page, which did the fetching.
export function CandidatesTable({ candidates, interviews, jobs }: Props) {
  const [query, setQuery] = useState("");
  const [jobId, setJobId] = useState("all");

  // The API sorts interviews newest first, so the first match is the latest one.
  const rows = candidates.map((candidate) => ({
    candidate,
    interview: interviews.find((item) => item.candidateId?._id === candidate._id),
  }));

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(({ candidate }) => {
    const matchesJob = jobId === "all" || candidate.jobId?._id === jobId;
    const matchesQuery =
      !normalizedQuery ||
      candidate.name.toLowerCase().includes(normalizedQuery) ||
      candidate.email.toLowerCase().includes(normalizedQuery);

    return matchesJob && matchesQuery;
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email..."
            className="h-9 pl-9"
            aria-label="Search candidates"
          />
        </div>

        <div className="w-64">
          <NativeSelect
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            aria-label="Filter by position"
          >
            <option value="all">All positions</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="grid grid-cols-[2fr_2fr_1.3fr_0.7fr_24px] gap-4 border-b px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Candidate</span>
          <span>Position</span>
          <span>Interview</span>
          <span className="text-right">Score</span>
          <span />
        </div>

        {visibleRows.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No candidates match your search.
          </p>
        )}

        {visibleRows.map(({ candidate, interview }) => (
          <Link
            key={candidate._id}
            href={`/candidates/${candidate._id}`}
            className="grid grid-cols-[2fr_2fr_1.3fr_0.7fr_24px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
              </Avatar>

              <div>
                <p className="text-sm font-medium">{candidate.name}</p>
                <p className="text-xs text-muted-foreground">{candidate.email}</p>
              </div>
            </div>

            <p className="text-sm">{candidate.jobId?.title ?? "—"}</p>

            {interview ? (
              <InterviewStatusBadge status={toBadgeStatus(interview.status)} />
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not invited
              </Badge>
            )}

            <div className="text-right">
              <Score value={interview?.evaluation?.score} />
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </>
  );
}
