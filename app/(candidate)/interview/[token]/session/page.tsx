import type { Metadata } from "next";

import { getInviteService } from "@/app/services/inviteService";
import { InterviewSession } from "@/components/candidate/interview-session";
import { InviteError } from "@/components/candidate/invite-error";

export const metadata: Metadata = { title: "Interview" };

// Step 3 of 3. The server checks the link is still usable; the client component
// then connects to LiveKit when the candidate clicks "Begin interview".
export default async function InterviewSessionPage({
  params,
}: PageProps<"/interview/[token]/session">) {
  const { token } = await params;
  const { invite, error } = await getInviteService(token);

  if (error) return <InviteError message={error.message} />;

  return (
    <InterviewSession
      token={token}
      candidateName={invite.candidateName}
      jobTitle={invite.jobTitle}
      maxMinutes={invite.maxMinutes}
      questionCount={invite.questionCount}
    />
  );
}
