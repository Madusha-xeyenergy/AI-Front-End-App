import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

const CandidateLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            AI Interview
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
};

export default CandidateLayout;
