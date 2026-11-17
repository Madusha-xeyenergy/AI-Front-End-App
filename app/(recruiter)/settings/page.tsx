"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { PageHeader } from "@/components/recruiter/page-header";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    completed: true,
    started: false,
    weeklySummary: true,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // POC: settings are not persisted yet.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your profile and AI interviewer defaults."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your details as shown to candidates.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue="Recruiter" className="h-9" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="recruiter@example.com"
                className="h-9"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company">Company name</Label>
              <Input id="company" defaultValue="Acxis" className="h-9" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Interviewer</CardTitle>
            <CardDescription>
              Defaults applied to newly created interviews.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="voice">Interviewer voice</Label>
              <NativeSelect id="voice" defaultValue="female">
                <option value="female">Female — warm</option>
                <option value="male">Male — calm</option>
                <option value="neutral">Neutral</option>
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Interview language</Label>
              <NativeSelect id="language" defaultValue="en">
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-duration">Default duration</Label>
              <NativeSelect id="default-duration" defaultValue="30">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Invitation expires after</Label>
              <NativeSelect id="expiry" defaultValue="7">
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
              </NativeSelect>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose which emails you receive.</CardDescription>
          </CardHeader>

          <CardContent className="divide-y">
            <ToggleRow
              label="Interview completed"
              description="When a candidate finishes and the AI report is ready."
              checked={notifications.completed}
              onChange={(completed) =>
                setNotifications({ ...notifications, completed })
              }
            />
            <ToggleRow
              label="Interview started"
              description="When a candidate opens their interview link."
              checked={notifications.started}
              onChange={(started) =>
                setNotifications({ ...notifications, started })
              }
            />
            <ToggleRow
              label="Weekly summary"
              description="A digest of interview activity every Monday."
              checked={notifications.weeklySummary}
              onChange={(weeklySummary) =>
                setNotifications({ ...notifications, weeklySummary })
              }
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              Settings saved
            </span>
          )}
          <Button type="submit" size="lg" className="px-4">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4.5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
