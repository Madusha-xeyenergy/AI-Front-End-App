import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Interview complete" };

// Shown after the room closes. No invite lookup here: once the interview is
// completed the backend reports the link as used (410), which is expected.
export default function InterviewCompletePage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold">Thank you!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your interview has ended. The hiring team will review it and be in
            touch soon. You can close this tab.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
