"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Mic, MicOff, Volume2 } from "lucide-react";

import { useMicrophone } from "@/components/candidate/use-microphone";
import { useSpeechSynthesis } from "@/components/candidate/use-speech";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Browser-only checks (getUserMedia + speech synthesis), so this is a Client Component.
// It asks for microphone permission now, so the real interview doesn't stall on the prompt.
export function DeviceCheck({ token, jobTitle }: { token: string; jobTitle: string }) {
  const router = useRouter();

  const microphone = useMicrophone();
  const speech = useSpeechSynthesis();
  const [heardAudio, setHeardAudio] = useState(false);
  const [testPlayed, setTestPlayed] = useState(false);
  const [consent, setConsent] = useState(false);

  const micReady = microphone.status === "granted";
  const speakerReady = heardAudio || !speech.supported;
  const canStart = micReady && speakerReady && consent;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <Link
        href={`/interview/${token}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Device check</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Let&apos;s make sure the interviewer can hear you, and you can hear the
        interviewer.
      </p>

      <div className="space-y-4">
        {/* Microphone */}
        <Card>
          <CardHeader>
            <StepTitle step={1} done={micReady} title="Microphone" />
            <CardDescription>
              Allow access, then say a few words to test the level.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {microphone.status === "granted" ? (
              <div className="flex items-center gap-3">
                <Mic className="h-4 w-4 text-primary" />
                <LevelMeter level={microphone.level} />
              </div>
            ) : microphone.status === "denied" ? (
              <Notice icon={MicOff}>
                Microphone access was blocked. Allow it from the address bar
                (lock icon) and try again.
              </Notice>
            ) : microphone.status === "unsupported" ? (
              <Notice icon={MicOff}>
                Your browser doesn&apos;t support microphone access. Please use
                a recent version of Chrome or Edge.
              </Notice>
            ) : null}

            {microphone.status !== "granted" && (
              <Button
                variant="outline"
                size="lg"
                className="mt-3"
                onClick={microphone.start}
                disabled={microphone.status === "requesting"}
              >
                <Mic />
                {microphone.status === "requesting"
                  ? "Waiting for permission..."
                  : microphone.status === "denied"
                    ? "Try again"
                    : "Allow microphone"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Speakers */}
        <Card>
          <CardHeader>
            <StepTitle step={2} done={speakerReady} title="Speakers" />
            <CardDescription>
              Play a test message to check your volume.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {speech.supported ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setTestPlayed(true);
                    speech.speak(
                      "Hello! This is a sound check. If you can hear me clearly, you're all set."
                    );
                  }}
                  disabled={speech.speaking}
                >
                  <Volume2 />
                  {speech.speaking ? "Playing..." : "Play test sound"}
                </Button>

                {testPlayed && !heardAudio && (
                  <Button size="lg" onClick={() => setHeardAudio(true)}>
                    <Check />I can hear it
                  </Button>
                )}
              </div>
            ) : (
              <Notice icon={Volume2}>
                Your browser can&apos;t play a test sound. Make sure your volume
                is turned up before you start.
              </Notice>
            )}
          </CardContent>
        </Card>

        {/* Consent */}
        <Card>
          <CardHeader>
            <StepTitle step={3} done={consent} title="Consent" />
          </CardHeader>

          <CardContent>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              I agree that my interview will be recorded (camera, entire screen
              and voice), transcribed and evaluated by AI, and shared with the
              hiring team for {jobTitle}.
            </label>
          </CardContent>
        </Card>
      </div>

      <Button
        size="lg"
        className="mt-6 h-10 w-full"
        disabled={!canStart}
        // Leaving this page unmounts useMicrophone, which releases the test microphone;
        // the interview page opens its own through LiveKit.
        onClick={() => router.push(`/interview/${token}/session`)}
      >
        Continue
      </Button>

      {!canStart && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Complete all steps above to continue.
        </p>
      )}
    </div>
  );
}

function StepTitle({
  step,
  done,
  title,
}: {
  step: number;
  done: boolean;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
          done
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : step}
      </span>
      <CardTitle>{title}</CardTitle>
    </div>
  );
}

function LevelMeter({ level }: { level: number }) {
  const bars = 20;
  const active = Math.round(level * bars);

  return (
    <div className="flex h-6 flex-1 items-end gap-1" aria-label="Microphone level">
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          className={cn(
            "flex-1 rounded-sm transition-colors",
            index < active ? "bg-emerald-500" : "bg-muted"
          )}
          style={{ height: `${30 + (index / bars) * 70}%` }}
        />
      ))}
    </div>
  );
}

function Notice({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
