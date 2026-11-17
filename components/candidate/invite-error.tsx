import { CircleSlash } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/** Shown instead of the interview when the link is invalid, expired, completed or cancelled. */
export function InviteError({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CircleSlash className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold">{message}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If you think this is a mistake, please contact the recruiter who
            sent you this link.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
