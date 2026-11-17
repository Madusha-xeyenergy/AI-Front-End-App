// Mock data for the POC. Replace with API calls once the backend is available.

export type JobStatus = "Active" | "Draft" | "Closed";

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  status: JobStatus;
  createdAt: string;
  description: string;
  skills: string[];
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  jobId: string;
  experienceYears: number;
  appliedAt: string;
  cvFile: string;
  skills: string[];
};

export type InterviewStatus = "Pending" | "In Progress" | "Completed" | "Expired";
export type InterviewFocus = "Technical" | "Behavioral" | "Mixed";
export type Recommendation = "Strong Hire" | "Hire" | "Maybe" | "No Hire";

export type TranscriptEntry = {
  speaker: "ai" | "candidate";
  text: string;
  time: string;
};

export type Interview = {
  id: string;
  token: string;
  candidateId: string;
  jobId: string;
  status: InterviewStatus;
  focus: InterviewFocus;
  durationMinutes: number;
  questionCount: number;
  sentAt: string;
  completedAt?: string;
  score?: number;
  recommendation?: Recommendation;
  summary?: string;
  competencies?: { name: string; score: number }[];
  strengths?: string[];
  concerns?: string[];
  transcript?: TranscriptEntry[];
};

export const jobs: Job[] = [
  {
    id: "job-1",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Colombo, Sri Lanka (Hybrid)",
    employmentType: "Full-time",
    status: "Active",
    createdAt: "Sep 02, 2026",
    description:
      "Design, build and maintain scalable web services. Mentor engineers and drive technical decisions across the platform team.",
    skills: ["TypeScript", "React", "Node.js", "REST APIs", "System Design"],
  },
  {
    id: "job-2",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    employmentType: "Full-time",
    status: "Active",
    createdAt: "Sep 10, 2026",
    description:
      "Own the end-to-end design of product features, from discovery and wireframes to polished UI and usability testing.",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
  },
  {
    id: "job-3",
    title: "Backend Developer",
    department: "Engineering",
    location: "Colombo, Sri Lanka",
    employmentType: "Full-time",
    status: "Active",
    createdAt: "Sep 14, 2026",
    description:
      "Build reliable APIs and data pipelines. Work closely with frontend and data teams to ship features quickly and safely.",
    skills: ["Node.js", "PostgreSQL", "Docker", "AWS"],
  },
  {
    id: "job-4",
    title: "Customer Support Executive",
    department: "Customer Success",
    location: "Kandy, Sri Lanka",
    employmentType: "Full-time",
    status: "Draft",
    createdAt: "Sep 25, 2026",
    description:
      "Help customers get the most out of our product through clear, friendly and timely support across chat and email.",
    skills: ["Communication", "Problem Solving", "Zendesk"],
  },
];

export const candidates: Candidate[] = [
  {
    id: "cand-1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+94 77 123 4567",
    location: "Colombo",
    jobId: "job-1",
    experienceYears: 6,
    appliedAt: "Sep 20, 2026",
    cvFile: "john-smith-cv.pdf",
    skills: ["TypeScript", "React", "Node.js", "GraphQL"],
  },
  {
    id: "cand-2",
    name: "Sarah Lee",
    email: "sarah@example.com",
    phone: "+94 77 234 5678",
    location: "Remote",
    jobId: "job-2",
    experienceYears: 4,
    appliedAt: "Sep 21, 2026",
    cvFile: "sarah-lee-cv.pdf",
    skills: ["Figma", "User Research", "Design Systems"],
  },
  {
    id: "cand-3",
    name: "David Perera",
    email: "david@example.com",
    phone: "+94 77 345 6789",
    location: "Colombo",
    jobId: "job-3",
    experienceYears: 3,
    appliedAt: "Sep 23, 2026",
    cvFile: "david-perera-cv.pdf",
    skills: ["Node.js", "PostgreSQL", "Docker"],
  },
  {
    id: "cand-4",
    name: "Emily Johnson",
    email: "emily@example.com",
    phone: "+94 77 456 7890",
    location: "Galle",
    jobId: "job-1",
    experienceYears: 5,
    appliedAt: "Sep 24, 2026",
    cvFile: "emily-johnson-cv.pdf",
    skills: ["React", "TypeScript", "AWS"],
  },
  {
    id: "cand-5",
    name: "Nimal Fernando",
    email: "nimal@example.com",
    phone: "+94 77 567 8901",
    location: "Colombo",
    jobId: "job-3",
    experienceYears: 7,
    appliedAt: "Sep 18, 2026",
    cvFile: "nimal-fernando-cv.pdf",
    skills: ["Java", "Node.js", "Kubernetes"],
  },
];

export const interviews: Interview[] = [
  {
    id: "int-1",
    token: "demo-john-smith",
    candidateId: "cand-1",
    jobId: "job-1",
    status: "Completed",
    focus: "Mixed",
    durationMinutes: 30,
    questionCount: 8,
    sentAt: "Sep 25, 2026",
    completedAt: "Sep 28, 2026",
    score: 86,
    recommendation: "Hire",
    summary:
      "John demonstrated strong full-stack fundamentals and clear communication. He explained trade-offs in API design well and gave concrete examples of mentoring. System design answers were solid but lacked depth on observability.",
    competencies: [
      { name: "Technical knowledge", score: 88 },
      { name: "Problem solving", score: 84 },
      { name: "Communication", score: 90 },
      { name: "Relevant experience", score: 82 },
    ],
    strengths: [
      "Clear, structured answers with real project examples",
      "Deep React and TypeScript knowledge",
      "Good awareness of API versioning and backward compatibility",
    ],
    concerns: [
      "Limited experience with monitoring and observability tooling",
      "Could elaborate more on handling production incidents",
    ],
    transcript: [
      {
        speaker: "ai",
        time: "00:00",
        text: "Hi John, thanks for joining. Could you start by telling me about a recent project you're proud of?",
      },
      {
        speaker: "candidate",
        time: "00:12",
        text: "Sure. Last year I led the rebuild of our customer dashboard in React and TypeScript. We moved from a monolith to a set of REST services and cut page load time by around 40%.",
      },
      {
        speaker: "ai",
        time: "01:05",
        text: "Great. How did you approach versioning those REST APIs so existing clients didn't break?",
      },
      {
        speaker: "candidate",
        time: "01:18",
        text: "We used URL-based versioning, kept the old version running in parallel, and added contract tests so every change was checked against consumer expectations.",
      },
      {
        speaker: "ai",
        time: "02:40",
        text: "Tell me about a time you mentored a junior engineer. What did you focus on?",
      },
      {
        speaker: "candidate",
        time: "02:52",
        text: "I paired with a new graduate for their first three months. We focused on code review habits and breaking tasks into small pull requests. They were leading a feature by month four.",
      },
    ],
  },
  {
    id: "int-2",
    token: "demo-sarah-lee",
    candidateId: "cand-2",
    jobId: "job-2",
    status: "Completed",
    focus: "Behavioral",
    durationMinutes: 30,
    questionCount: 8,
    sentAt: "Sep 24, 2026",
    completedAt: "Sep 27, 2026",
    score: 91,
    recommendation: "Strong Hire",
    summary:
      "Sarah gave excellent, user-centred answers with a clear design process. She showed strong collaboration skills and handled a question about conflicting stakeholder feedback particularly well.",
    competencies: [
      { name: "Design process", score: 94 },
      { name: "Problem solving", score: 89 },
      { name: "Communication", score: 93 },
      { name: "Relevant experience", score: 88 },
    ],
    strengths: [
      "Well-articulated research-driven design process",
      "Strong stakeholder management examples",
      "Experience building and maintaining a design system",
    ],
    concerns: ["Less exposure to data-heavy B2B dashboards"],
    transcript: [
      {
        speaker: "ai",
        time: "00:00",
        text: "Hi Sarah, welcome. Can you walk me through your design process for a new feature?",
      },
      {
        speaker: "candidate",
        time: "00:10",
        text: "I start with discovery: talking to users and reviewing analytics. Then I sketch several directions, test low-fidelity prototypes, and only then move to high-fidelity UI.",
      },
    ],
  },
  {
    id: "int-3",
    token: "demo-david-perera",
    candidateId: "cand-3",
    jobId: "job-3",
    status: "In Progress",
    focus: "Technical",
    durationMinutes: 45,
    questionCount: 10,
    sentAt: "Sep 27, 2026",
  },
  {
    id: "int-4",
    token: "demo-emily-johnson",
    candidateId: "cand-4",
    jobId: "job-1",
    status: "Pending",
    focus: "Technical",
    durationMinutes: 30,
    questionCount: 8,
    sentAt: "Sep 28, 2026",
  },
  {
    id: "int-5",
    token: "demo-nimal-fernando",
    candidateId: "cand-5",
    jobId: "job-3",
    status: "Completed",
    focus: "Technical",
    durationMinutes: 45,
    questionCount: 10,
    sentAt: "Sep 20, 2026",
    completedAt: "Sep 22, 2026",
    score: 64,
    recommendation: "Maybe",
    summary:
      "Nimal has broad backend experience but his answers on Node.js specifics and PostgreSQL query optimisation were surface-level. Communication was clear.",
    competencies: [
      { name: "Technical knowledge", score: 60 },
      { name: "Problem solving", score: 66 },
      { name: "Communication", score: 74 },
      { name: "Relevant experience", score: 58 },
    ],
    strengths: ["Broad exposure to infrastructure and Kubernetes"],
    concerns: [
      "Limited depth on Node.js internals",
      "Struggled to explain query indexing strategies",
    ],
    transcript: [],
  },
];

/** Questions the AI interviewer asks in the candidate demo session. */
export const demoQuestions = [
  "To start, could you briefly introduce yourself and your recent experience?",
  "Tell me about a challenging technical problem you solved recently. How did you approach it?",
  "How do you make sure the code you ship is reliable and maintainable?",
  "Describe a situation where you disagreed with a teammate. How did you resolve it?",
  "What interests you about this role, and what would you focus on in your first 90 days?",
];

export function getJob(id: string) {
  return jobs.find((job) => job.id === id);
}

export function getCandidate(id: string) {
  return candidates.find((candidate) => candidate.id === id);
}

export function getInterview(id: string) {
  return interviews.find((interview) => interview.id === id);
}

export function getInterviewByToken(token: string) {
  return interviews.find((interview) => interview.token === token);
}

export function getCandidatesForJob(jobId: string) {
  return candidates.filter((candidate) => candidate.jobId === jobId);
}

export function getInterviewsForCandidate(candidateId: string) {
  return interviews.filter(
    (interview) => interview.candidateId === candidateId
  );
}

export function getLatestInterviewForCandidate(candidateId: string) {
  return getInterviewsForCandidate(candidateId)[0];
}

export type InterviewInvite = {
  candidate: Candidate;
  job: Job;
  durationMinutes: number;
  focus: InterviewFocus;
};

/** Builds a token for an invite created in the UI (no backend in the POC). */
export function createInviteToken(candidateId: string, jobId: string) {
  return `inv~${candidateId}~${jobId}`;
}

/** Resolves a candidate-facing interview link token to its invite details. */
export function resolveInvite(token: string): InterviewInvite | undefined {
  const decoded = decodeURIComponent(token);
  const interview = getInterviewByToken(decoded);

  if (interview) {
    const candidate = getCandidate(interview.candidateId);
    const job = getJob(interview.jobId);
    if (!candidate || !job) return undefined;

    return {
      candidate,
      job,
      durationMinutes: interview.durationMinutes,
      focus: interview.focus,
    };
  }

  const [prefix, candidateId, jobId] = decoded.split("~");
  const candidate = candidateId && getCandidate(candidateId);
  const job = jobId && getJob(jobId);
  if (prefix !== "inv" || !candidate || !job) return undefined;

  return {
    candidate,
    job,
    durationMinutes: 30,
    focus: "Mixed",
  };
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
