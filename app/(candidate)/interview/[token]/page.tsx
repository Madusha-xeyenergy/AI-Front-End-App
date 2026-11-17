import type { Metadata } from "next";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Clock3,
  Headphones,
  ListOrdered,
  Mic,
  Volume2,
  Wifi,
} from "lucide-react";

import { getInviteService } from "@/app/services/inviteService";
import { InviteError } from "@/components/candidate/invite-error";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Your Interview" };

// Step 1 of 3: the candidate opens the link from the recruiter.
export default async function InterviewWelcomePage({
  params,
}: PageProps<"/interview/[token]">) {
  const { token } = await params;
  // The backend hashes the token and looks up the interview; it also checks expiry.
  const { invite, error } = await getInviteService(token);

  if (error) return <InviteError message={error.message} />;

  const firstName = invite.candidateName.split(" ")[0];
  // A candidate whose connection dropped mid-interview can come back with the same link.
  const isRejoin = invite.status === "in_progress";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-primary">
          Interview invitation
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {isRejoin
            ? `Welcome back, ${firstName}`
            : `Hi ${firstName}, welcome to your AI interview`}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isRejoin
            ? "Your interview was interrupted. You can rejoin and continue where you left off."
            : "You'll have a short voice conversation with our AI interviewer. Answer naturally, as you would with a person."}
        </p>
      </div>

      <Card>
        <CardContent className="px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoTile
              icon={BriefcaseBusiness}
              label="Position"
              value={invite.jobTitle}
            />
            <InfoTile
              icon={Clock3}
              label="Duration"
              value={`Up to ${invite.maxMinutes} min`}
            />
            <InfoTile
              icon={ListOrdered}
              label="Questions"
              value={`${invite.questionCount} questions`}
            />
          </div>

          <div className="mt-6 border-t pt-6">
            <p className="mb-4 text-sm font-medium">Before you start</p>

            <ul className="space-y-3">
              <Tip icon={Headphones} text="Find a quiet place. Headphones give the best results." />
              <Tip icon={Mic} text="Allow microphone access when your browser asks." />
              <Tip icon={Volume2} text="Turn your volume up so you can hear the interviewer." />
              <Tip icon={Wifi} text="Use a stable internet connection and a recent Chrome or Edge browser." />
            </ul>
          </div>

          <div className="mt-6 rounded-lg bg-muted/60 p-4 text-xs leading-5 text-muted-foreground">
            Your answers are recorded and transcribed so the hiring team can
            review them. The AI provides an assessment to support, not replace,
            the team&apos;s decision.
          </div>

          <Link
            href={`/interview/${token}/setup`}
            className={cn(buttonVariants({ size: "lg" }), "mt-6 h-10 w-full")}
          >
            Continue to device check
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function Tip({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-muted-foreground">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="pt-1">{text}</span>
    </li>
  );
}
