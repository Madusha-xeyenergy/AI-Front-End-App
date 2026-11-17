import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Users,
  Video,
} from "lucide-react";

import { PageHeader } from "@/components/recruiter/page-header";
import {
  InterviewStatusBadge,
  Score,
} from "@/components/recruiter/status-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  candidates,
  getCandidate,
  getInitials,
  getJob,
  interviews,
  jobs,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const DashboardPage = () => {
  const activeJobs = jobs.filter((job) => job.status === "Active").length;
  const inProgress = interviews.filter(
    (interview) => interview.status === "In Progress"
  ).length;
  const completed = interviews.filter(
    (interview) => interview.status === "Completed"
  );
  const completionRate = Math.round(
    (completed.length / interviews.length) * 100
  );
  const averageScore = Math.round(
    completed.reduce((total, interview) => total + (interview.score ?? 0), 0) /
      completed.length
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your recruitment activity."
        action={
          <Link href="/interviews/create" className={buttonVariants()}>
            <Video />
            Create Interview
          </Link>
        }
      />

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Jobs"
          value={activeJobs}
          description={`${jobs.length} jobs in total`}
          icon={BriefcaseBusiness}
        />

        <StatCard
          title="Candidates"
          value={candidates.length}
          description="Across all open positions"
          icon={Users}
        />

        <StatCard
          title="Interviews"
          value={interviews.length}
          description={`${inProgress} in progress`}
          icon={Video}
        />

        <StatCard
          title="Completed"
          value={completed.length}
          description={`${completionRate}% completion · avg score ${averageScore}%`}
          icon={CheckCircle2}
        />
      </div>

      {/* Recent interviews */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Interviews</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest candidate interviews.
            </p>
          </div>

          <Link
            href="/interviews"
            className={buttonVariants({ variant: "ghost" })}
          >
            View all
            <ArrowUpRight />
          </Link>
        </CardHeader>

        <CardContent>
          <div className="divide-y">
            {interviews.slice(0, 5).map((interview) => {
              const candidate = getCandidate(interview.candidateId);
              const job = getJob(interview.jobId);

              return (
                <Link
                  key={interview.id}
                  href={`/interviews/${interview.id}`}
                  className={cn(
                    "-mx-2 flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(candidate?.name ?? "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{candidate?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {job?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <InterviewStatusBadge status={interview.status} />

                    <div className="w-12 text-right">
                      <Score value={interview.score} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

type StatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
};

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="mt-3">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>

          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardPage;
