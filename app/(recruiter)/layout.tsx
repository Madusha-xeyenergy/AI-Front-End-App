import { ReactNode } from "react";

import RecruiterHeader from "@/components/recruiter/recruiter-header";
import RecruiterSidebar from "@/components/recruiter/recruiter-sidebar";

const RecruiterLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <RecruiterSidebar />

      <div className="flex min-h-screen flex-col pl-64">
        <RecruiterHeader />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
