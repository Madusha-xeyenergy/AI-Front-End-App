"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

const subscribe = () => () => {};

/** Shows the candidate's interview link and copies it to the clipboard. */
export function InviteLink({ path }: { path: string }) {
  // Origin is only known in the browser; render the relative path on the server.
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ""
  );
  const [copied, setCopied] = useState(false);

  // The backend returns a full URL; mock pages pass a relative path.
  const url = path.startsWith("http") ? path : `${origin}${path}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. non-secure origin); the link stays visible to copy manually.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-lg border bg-muted/50 px-3 py-2 font-mono text-xs">
        {url}
      </code>

      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        onClick={copy}
        aria-label="Copy interview link"
      >
        {copied ? <Check className="text-emerald-600" /> : <Copy />}
      </Button>
    </div>
  );
}
