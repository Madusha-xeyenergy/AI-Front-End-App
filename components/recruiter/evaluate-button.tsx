"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles } from "lucide-react";

import { evaluateInterviewService } from "@/app/services/interviewClientService";
import { Button } from "@/components/ui/button";

// Runs (or re-runs) the AI evaluation, then re-renders the Server Component page with the new result.
// A separate Client Component because the detail page itself is a Server Component (no onClick there).
export function EvaluateButton({
  interviewId,
  label = "Evaluate now",
  variant = "default",
}: {
  interviewId: string;
  label?: string;
  variant?: "default" | "outline";
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setRunning(true);
    setError(null);

    try {
      await evaluateInterviewService(interviewId);
      // Re-fetches the page's server data; the evaluation shows up without a full reload.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't evaluate the interview");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button type="button" size="sm" variant={variant} onClick={handleClick} disabled={running}>
        {variant === "outline" ? <RefreshCw /> : <Sparkles />}
        {running ? "Evaluating…" : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
