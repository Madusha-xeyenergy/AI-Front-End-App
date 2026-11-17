"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  ListOrdered,
  Mic,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";

import type { Candidate } from "@/app/services/candidateService";
import {
  createInterviewService,
  generateQuestionsService,
  type GeneratedQuestion,
  type InterviewSettings,
  type QuestionType,
} from "@/app/services/interviewClientService";
import type { Job } from "@/app/services/jobSevices";
import { InviteLink } from "@/components/recruiter/copy-link-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Focus = InterviewSettings["focus"];

// `value` is what the API expects; `label` is what the recruiter sees.
const focusOptions: {
  value: Focus;
  label: string;
  description: string;
  evaluates: string[];
}[] = [
  {
    value: "technical",
    label: "Technical",
    description: "Technical skills",
    evaluates: [
      "Technical knowledge",
      "Problem solving",
      "Code quality mindset",
      "Relevant experience",
    ],
  },
  {
    value: "behavioral",
    label: "Behavioral",
    description: "Soft skills",
    evaluates: [
      "Communication",
      "Teamwork",
      "Ownership",
      "Culture alignment",
    ],
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "Technical + behavioral",
    evaluates: [
      "Technical knowledge",
      "Problem solving",
      "Communication",
      "Relevant experience",
    ],
  },
];

// Limits from the backend validator (interview.validator.ts).
const MAX_QUESTIONS = 15;
const MIN_QUESTION_LENGTH = 5;

// `id` is only for React's list keys, so editing/removing a box keeps focus
// on the right one. It's not sent to the backend.
type EditableQuestion = GeneratedQuestion & { id: string };

// Rubric lists are edited as one point per line. Empty lines are kept while typing
// (so Enter works) and dropped on submit.
const toLines = (items: string[]) => items.join("\n");
const fromLines = (text: string) => text.split("\n");
const cleanLines = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

type CreateInterviewFormProps = {
  jobs: Job[];
  candidates: Candidate[];
  defaultJobId?: string;
  defaultCandidateId?: string;
};

export function CreateInterviewForm({
  jobs,
  candidates,
  defaultJobId = "",
  defaultCandidateId = "",
}: CreateInterviewFormProps) {
  const [jobId, setJobId] = useState(defaultJobId);
  const [candidateId, setCandidateId] = useState(defaultCandidateId);
  const [duration, setDuration] = useState("30");
  const [questionCount, setQuestionCount] = useState("3");
  const [focus, setFocus] = useState<Focus>("technical");
  const [instructions, setInstructions] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  // Questions from the AI, editable by the recruiter before saving.
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const job = jobs.find((item) => item._id === jobId);
  const candidate = candidates.find((item) => item._id === candidateId);
  const selectedFocus = focusOptions.find((option) => option.value === focus)!;

  // Candidates who applied for the selected job are listed first.
  const sortedCandidates = [...candidates].sort(
    (a, b) => Number(b.jobId?._id === jobId) - Number(a.jobId?._id === jobId)
  );

  // The same settings are sent to both "generate" and "create".
  const settings: InterviewSettings = {
    jobId,
    candidateId,
    focus,
    maxMinutes: Number(duration),
    instructions,
  };

  async function handleGenerate() {
    setShowErrors(true);
    setError(null);
    if (!job || !candidate) return;

    setGenerating(true);

    try {
      const result = await generateQuestionsService(settings, Number(questionCount));
      setQuestions(
        result.questions.map((question) => ({ ...question, id: crypto.randomUUID() }))
      );
      setModel(result.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate questions");
    } finally {
      setGenerating(false);
    }
  }

  // One update function for every field (text, type, rubric), so each input stays a one-liner.
  function updateQuestion(id: string, changes: Partial<GeneratedQuestion>) {
    setQuestions((current) =>
      current.map((question) => (question.id === id ? { ...question, ...changes } : question))
    );
  }

  function removeQuestion(id: string) {
    setQuestions((current) => current.filter((question) => question.id !== id));
  }

  // Hand-written questions start without a rubric; they're scored on the general criteria only.
  function addQuestion() {
    setQuestions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        text: "",
        topic: "",
        type: focus === "behavioral" ? "behavioral" : "technical",
        rubric: { lookFor: [], redFlags: [] },
      },
    ]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    setError(null);
    if (!job || !candidate) return;

    // Drop empty boxes; the backend rejects questions under 5 characters.
    const finalQuestions = questions
      .map(({ text, topic, type, rubric }) => ({
        text: text.trim(),
        topic,
        type,
        rubric: { lookFor: cleanLines(rubric.lookFor), redFlags: cleanLines(rubric.redFlags) },
      }))
      .filter((question) => question.text.length > 0);

    if (finalQuestions.length === 0) {
      setError("Generate or add at least one question.");
      return;
    }

    const tooShort = finalQuestions.findIndex((q) => q.text.length < MIN_QUESTION_LENGTH);
    if (tooShort !== -1) {
      setError(`Question ${tooShort + 1} is too short.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createInterviewService(settings, finalQuestions, model);
      setInviteUrl(result.inviteUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the interview");
    } finally {
      setSubmitting(false);
    }
  }

  if (inviteUrl && candidate && job) {
    return (
      <div className="mx-auto max-w-lg pt-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h2 className="text-lg font-semibold">Interview created</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Send this link to {candidate.name} ({candidate.email}) for a{" "}
                {duration}-minute {selectedFocus.label.toLowerCase()} AI interview
                for {job.title}. It expires in 7 days.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <Label>Candidate interview link</Label>
              <InviteLink path={inviteUrl} />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/interviews"
                className={buttonVariants({ variant: "outline" })}
              >
                Back to Interviews
              </Link>
              <Link href={inviteUrl} target="_blank" className={buttonVariants()}>
                <ExternalLink />
                Try candidate view
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-[1fr_360px]"
    >
      {/* Main form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
            <CardDescription>
              Select the job and candidate for this interview.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="job">Job Position</Label>
              <NativeSelect
                id="job"
                icon={<BriefcaseBusiness />}
                value={jobId}
                onChange={(event) => setJobId(event.target.value)}
                aria-invalid={showErrors && !job}
              >
                <option value="" disabled>
                  Select a job
                </option>
                {jobs.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </NativeSelect>
              {showErrors && !job && (
                <p className="text-xs text-destructive">Please select a job.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidate">Candidate</Label>
              <NativeSelect
                id="candidate"
                icon={<UserRound />}
                value={candidateId}
                onChange={(event) => setCandidateId(event.target.value)}
                aria-invalid={showErrors && !candidate}
              >
                <option value="" disabled>
                  Select a candidate
                </option>
                {sortedCandidates.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} — {item.email}
                    {jobId && item.jobId?._id === jobId ? " (applied)" : ""}
                  </option>
                ))}
              </NativeSelect>
              {showErrors && !candidate && (
                <p className="text-xs text-destructive">
                  Please select a candidate.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Configuration</CardTitle>
            <CardDescription>
              Configure how the AI interviewer should conduct the interview.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Interview Duration</Label>
                <NativeSelect
                  id="duration"
                  icon={<Clock3 />}
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions">Number of Questions</Label>
                <NativeSelect
                  id="questions"
                  icon={<ListOrdered />}
                  value={questionCount}
                  onChange={(event) => setQuestionCount(event.target.value)}
                >
                  <option value="5">5 questions</option>
                  <option value="8">8 questions</option>
                  <option value="10">10 questions</option>
                  <option value="12">12 questions</option>
                </NativeSelect>
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-medium">
                Interview Focus
              </legend>

              <div className="grid gap-3 sm:grid-cols-3">
                {focusOptions.map((option) => (
                  <FocusOption
                    key={option.value}
                    title={option.label}
                    description={option.description}
                    active={focus === option.value}
                    onSelect={() => setFocus(option.value)}
                  />
                ))}
              </div>
            </fieldset>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Interview Instructions</CardTitle>
            <CardDescription>
              Add any additional instructions for the AI interviewer.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Example: Focus on the candidate's experience with React, TypeScript, REST APIs, and problem solving."
              className="min-h-32 resize-none"
              aria-label="AI interview instructions"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              The AI will also use the selected job description and candidate
              CV to generate relevant questions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Questions</CardTitle>
            <CardDescription>
              Generate questions from the job and the candidate&apos;s CV, then
              edit them before sending.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                disabled={generating}
              >
                <Sparkles />
                {generating ? "Generating…" : "Generate questions"}
              </Button>
            ) : (
              <>
                <ol className="space-y-3">
                  {questions.map((question, index) => (
                    <li key={question.id} className="flex gap-3">
                      <span className="mt-2 w-5 shrink-0 text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>

                      <div className="flex-1 space-y-1.5">
                        <Textarea
                          value={question.text}
                          onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
                          placeholder="Type a question…"
                          aria-label={`Question ${index + 1}`}
                          className="resize-none"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="w-36">
                            <NativeSelect
                              value={question.type}
                              onChange={(event) =>
                                updateQuestion(question.id, { type: event.target.value as QuestionType })
                              }
                              aria-label={`Question ${index + 1} type`}
                              className="h-7 text-xs md:text-xs"
                            >
                              <option value="technical">Technical</option>
                              <option value="behavioral">Behavioral</option>
                            </NativeSelect>
                          </div>
                          {question.topic && <Badge variant="secondary">{question.topic}</Badge>}
                        </div>

                        <RubricEditor
                          index={index}
                          rubric={question.rubric}
                          onChange={(rubric) => updateQuestion(question.id, { rubric })}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(question.id)}
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ol>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    disabled={questions.length >= MAX_QUESTIONS}
                  >
                    <Plus />
                    Add question
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    <RefreshCw />
                    {generating ? "Generating…" : "Regenerate"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-right text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/interviews"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Cancel
          </Link>

          <Button
            type="submit"
            size="lg"
            className="px-4"
            disabled={submitting || generating || questions.length === 0}
          >
            <Sparkles />
            {submitting ? "Creating…" : "Create & Send Invitation"}
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-6 lg:sticky lg:top-22 lg:self-start">
        <Card className="pt-0">
          <div className="bg-primary px-6 py-5 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-medium">AI Interview</p>
                <p className="text-xs text-primary-foreground/70">
                  Interview preview
                </p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-5 px-6 pt-2">
            <PreviewField label="Position" value={job?.title} />
            <PreviewField label="Candidate" value={candidate?.name} />

            <div className="grid grid-cols-2 gap-4 border-y py-4">
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-medium">{duration} minutes</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="mt-1 text-sm font-medium">
                  {questions.length > 0 ? questions.length : questionCount} questions
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">AI will evaluate</p>

              <div className="space-y-3">
                {selectedFocus.evaluates.map((item) => (
                  <EvaluationItem key={item} text={item} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardContent>
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mic className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">Voice interview</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  The candidate will receive a secure interview link and
                  complete the interview with the AI voice interviewer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function PreviewField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-medium",
          !value && "font-normal text-muted-foreground italic"
        )}
      >
        {value ?? "Not selected"}
      </p>
    </div>
  );
}

function FocusOption({
  title,
  description,
  active,
  onSelect,
}: {
  title: string;
  description: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        {active && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    </button>
  );
}

// Collapsed by default (<details>), so the question list stays short; open it to review or edit.
function RubricEditor({
  index,
  rubric,
  onChange,
}: {
  index: number;
  rubric: GeneratedQuestion["rubric"];
  onChange: (rubric: GeneratedQuestion["rubric"]) => void;
}) {
  const points = cleanLines(rubric.lookFor).length;

  return (
    <details className="rounded-lg border px-3 py-2 text-sm">
      <summary className="cursor-pointer text-xs font-medium text-muted-foreground select-none">
        Scoring rubric · {points ? `${points} point${points === 1 ? "" : "s"} to look for` : "none (general criteria only)"}
      </summary>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`look-for-${index}`} className="text-xs">
            Look for (one per line)
          </Label>
          <Textarea
            id={`look-for-${index}`}
            value={toLines(rubric.lookFor)}
            onChange={(event) => onChange({ ...rubric, lookFor: fromLines(event.target.value) })}
            placeholder="e.g. Explains why they chose Redux over Context"
            className="min-h-24 resize-y text-xs md:text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`red-flags-${index}`} className="text-xs">
            Red flags (one per line)
          </Label>
          <Textarea
            id={`red-flags-${index}`}
            value={toLines(rubric.redFlags)}
            onChange={(event) => onChange({ ...rubric, redFlags: fromLines(event.target.value) })}
            placeholder="e.g. Only describes what the team did"
            className="min-h-24 resize-y text-xs md:text-xs"
          />
        </div>
      </div>
    </details>
  );
}

function EvaluationItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <Check className="h-3 w-3" />
      </div>

      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}
