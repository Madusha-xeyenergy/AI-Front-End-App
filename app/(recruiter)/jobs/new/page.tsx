"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { createJobService, type CreateJobInput } from "@/app/services/jobClientService";
import type { Job } from "@/app/services/jobSevices";
import { PageHeader } from "@/components/recruiter/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

// `value` is the code the API expects; the text is what the recruiter sees.
const typeOptions: { value: Job["type"]; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
];

const modeOptions: { value: Job["mode"]; label: string }[] = [
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const statusOptions: { value: Job["status"]; label: string }[] = [
  { value: "open", label: "Open (accepting candidates)" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

export default function CreateJobPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Job["type"]>("full_time");
  const [mode, setMode] = useState<Job["mode"]>("on_site");
  const [status, setStatus] = useState<Job["status"]>("open");
  const [description, setDescription] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);

  const errors = {
    title: !title.trim() ? "Job title is required." : "",
    description:
      description.trim().length < 20
        ? "Add a description of at least 20 characters."
        : "",
  };
  const isValid = !errors.title && !errors.description;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    setError(null);
    if (!isValid) return;

    const input: CreateJobInput = {
      title: title.trim(),
      description: description.trim(),
      type,
      mode,
      status,
    };

    setSubmitting(true);
    try {
      const result = await createJobService(input);
      setCreatedJob(result.job);
    } catch (err) {
      // e.g. 401 (logged out) or a 422 validation message from the backend
      setError(err instanceof Error ? err.message : "Couldn't create the job");
    } finally {
      setSubmitting(false);
    }
  }

  if (createdJob) {
    return (
      <div className="mx-auto max-w-lg pt-12">
        <Card>
          <CardContent className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h2 className="text-lg font-semibold">Job created</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{createdJob.title}</span>{" "}
              is saved. Once candidates apply, you can invite them to an AI
              interview for this role.
            </p>

            <div className="mt-6 flex gap-3">
              <Link href="/jobs" className={buttonVariants({ variant: "outline" })}>
                Back to Jobs
              </Link>
              <Link
                href={`/interviews/create?job=${createdJob._id}`}
                className={buttonVariants()}
              >
                Create Interview
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create Job"
        description="Add a new position. The AI uses these details to tailor interview questions."
        action={
          <Link href="/jobs" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft />
            Back to Jobs
          </Link>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              General details candidates will see on their invitation.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Job title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="h-9"
                aria-invalid={showErrors && !!errors.title}
              />
              {showErrors && errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="type">Employment type</Label>
                <NativeSelect
                  id="type"
                  value={type}
                  onChange={(event) => setType(event.target.value as Job["type"])}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Work mode</Label>
                <NativeSelect
                  id="mode"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as Job["mode"])}
                >
                  {modeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <NativeSelect
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Job["status"])}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Requirements</CardTitle>
            <CardDescription>
              The AI interviewer generates questions from this description, so
              include the key responsibilities and required skills.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Job description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe responsibilities, required skills, team and expectations..."
                className="min-h-40"
                aria-invalid={showErrors && !!errors.description}
              />
              {showErrors && errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-right text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/jobs"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Cancel
          </Link>

          <Button type="submit" size="lg" className="px-4" disabled={submitting}>
            {submitting ? "Creating…" : "Create Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
