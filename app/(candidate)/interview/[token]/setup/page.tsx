import type { Metadata } from "next";

import { getInviteService } from "@/app/services/inviteService";
import { DeviceCheck } from "@/components/candidate/device-check";
import { InviteError } from "@/components/candidate/invite-error";

export const metadata: Metadata = { title: "Device check" };

// Step 2 of 3: microphone, speakers and consent. Nothing here talks to LiveKit yet.
export default async function DeviceSetupPage({
  params,
}: PageProps<"/interview/[token]/setup">) {
  const { token } = await params;
  const { invite, error } = await getInviteService(token);

  if (error) return <InviteError message={error.message} />;

  return <DeviceCheck token={token} jobTitle={invite.jobTitle} />;
}
