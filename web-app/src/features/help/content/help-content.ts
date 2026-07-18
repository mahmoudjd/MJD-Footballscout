export type HelpStep = {
  title: string
  description: string
  href: string
  action: string
}

export type FaqItem = {
  id: string
  question: string
  answer: string
  tips?: string[]
}

export type FaqGroup = {
  title: string
  description: string
  items: FaqItem[]
}

export type ReleaseNote = {
  version: string
  date: string
  title: string
  summary: string
  highlights: string[]
  featured?: boolean
}

export const helpSteps: HelpStep[] = [
  {
    title: "Discover Players",
    description:
      "Browse the player database and narrow the table with position and profile filters.",
    href: "/players",
    action: "Open Players",
  },
  {
    title: "Search the Web",
    description: "Find a player by name and import available scouting data from connected sources.",
    href: "/search",
    action: "Start Search",
  },
  {
    title: "Compare Profiles",
    description: "Review ELO, market value, age and profile details side by side.",
    href: "/compare",
    action: "Compare Players",
  },
  {
    title: "Build Watchlists",
    description: "Group interesting players into shortlists for later scouting decisions.",
    href: "/watchlists",
    action: "Open Watchlists",
  },
  {
    title: "Plan a Shadow Team",
    description: "Place primary targets and alternatives into a formation and reveal squad gaps.",
    href: "/shadow-team",
    action: "Build Shadow Team",
  },
  {
    title: "Manage Recruitment",
    description: "Move candidates through a pipeline and coordinate every recruitment decision.",
    href: "/recruitment",
    action: "Open Recruitment",
  },
]

export const faqGroups: FaqGroup[] = [
  {
    title: "Players & Data",
    description: "Searching, importing and understanding player information.",
    items: [
      {
        id: "find-player",
        question: "How do I find a player?",
        answer:
          "Use Players to filter existing profiles or Search to look up a player by name across the connected web sources.",
        tips: [
          "Enter at least 2 characters.",
          "Try the full name when several players share a surname.",
        ],
      },
      {
        id: "update-player",
        question: "How do I refresh player data?",
        answer:
          "Open the player profile and select Update Data. The app checks the connected sources and keeps the existing profile when no reliable update is found.",
      },
      {
        id: "elo-score",
        question: "What does the ELO value mean?",
        answer:
          "ELO is a relative performance indicator used to compare players. In the table, the progress bar reflects the available 0–100 ELO scale and should be read together with age, position and scouting context.",
      },
      {
        id: "similar-players",
        question: "How are similar players selected?",
        answer:
          "The recommendation score compares position, age, ELO, market value, preferred foot and nationality. Each result includes match reasons so you can understand the recommendation.",
      },
    ],
  },
  {
    title: "Scouting Workflow",
    description: "Comparisons, reports and watchlists.",
    items: [
      {
        id: "compare-players",
        question: "How do I compare players?",
        answer:
          "Open Compare, select at least 2 players and review the highlighted leaders across the available metrics.",
      },
      {
        id: "scouting-report",
        question: "Who can edit a scouting report?",
        answer:
          "Authenticated users can create a report. You can edit or delete only your own report, while the player profile shows the combined scouting summary.",
      },
      {
        id: "watchlist",
        question: "What is a watchlist?",
        answer:
          "A watchlist is a private collection of players. Use separate watchlists for transfer targets, position needs or follow-up scouting.",
      },
      {
        id: "shadow-team",
        question: "How does a Shadow Team work?",
        answer:
          "Choose a formation and add candidates to each position. The first player is the primary choice; additional players form the positional shortlist. The dashboard then calculates coverage, age, ELO, estimated market value and recommended alternatives.",
        tips: [
          "Select Set primary to promote an alternative.",
          "A player assigned to several positions is highlighted as a duplicate.",
        ],
      },
      {
        id: "recruitment-pipeline",
        question: "What is the Recruitment Pipeline?",
        answer:
          "The pipeline tracks every candidate from discovery through video review, live scouting, shortlist, approval and negotiation. Add an owner, deadline, priority and decision notes to keep the process accountable.",
      },
      {
        id: "recruitment-tools",
        question: "How do templates, replacements and Fit Score work together?",
        answer:
          "Templates standardize scout evaluations, replacement plans identify successors, saved searches monitor the player pool and Fit Score ranks players against your age, value, ELO and scouting priorities.",
      },
    ],
  },
  {
    title: "Account & Security",
    description: "Profile access, passwords and account status.",
    items: [
      {
        id: "forgot-password",
        question: "What can I do if I forgot my password?",
        answer:
          "Open Forgot Password from the login page, submit your email address and follow the reset instructions. The response does not reveal whether an account exists for that address.",
      },
      {
        id: "change-password",
        question: "Where can I change my password?",
        answer:
          "Open Profile & Security from the account menu. Enter your current password and choose a new password with at least 8 characters.",
      },
      {
        id: "deactivate-account",
        question: "What happens when I deactivate my account?",
        answer:
          "Your account remains stored for auditing but is marked as deactivated. Sign-in and authenticated API access are blocked until an administrator reactivates it.",
      },
    ],
  },
]

export const releaseNotes: ReleaseNote[] = [
  {
    version: "3.0",
    date: "2026-07-18",
    title: "Complete Scouting Workspace",
    summary:
      "A major update combining recruitment planning, player intelligence, account security and a unified scouting experience.",
    highlights: [
      "Build persistent Shadow Teams in four tactical formations with primary candidates and positional shortlists.",
      "Analyze squad coverage, missing positions, duplicate assignments, average age, estimated value and average ELO.",
      "Discover explainable similar-player recommendations based on position, age, ELO, market value, preferred foot and nationality.",
      "Create structured scouting reports and review player history for ELO, market value and club changes.",
      "Organize transfer targets in watchlists and compare selected players side by side.",
      "Manage profile information, reset or change passwords and safely deactivate accounts without deleting database records.",
      "Use the redesigned responsive interface with unified navigation, tables, profiles, filters, buttons and status feedback.",
      "Access the new Help & What’s New center with workflow guidance and searchable FAQs.",
      "Manage candidates through a seven-stage recruitment pipeline with priorities, owners, deadlines and decision notes.",
      "Create weighted scouting templates and reusable club-specific evaluation frameworks.",
      "Plan squad replacements with automatically suggested successors for vulnerable positions.",
      "Save talent searches, monitor changing match counts and surface new-player alerts.",
      "Rank the database with configurable Recruitment Fit Scores combining ELO, age, value and scouting progress.",
    ],
    featured: true,
  },
]
