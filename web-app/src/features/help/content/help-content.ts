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
    version: "0.6.0",
    date: "2026-07-18",
    title: "Explainable Similar Players",
    summary: "Player profiles now include data-based alternatives with a transparent match score.",
    highlights: [
      "Added a Similar tab to player profiles.",
      "Scores position, age, ELO, market value, preferred foot and nationality.",
      "Displays plain-language reasons for every recommendation.",
    ],
    featured: true,
  },
  {
    version: "0.5.0",
    date: "2026-07-18",
    title: "Unified Scouting Interface",
    summary: "Core pages now share a wider, more consistent responsive layout and visual system.",
    highlights: [
      "Modernized player table, filters, profile tabs and attributes.",
      "Unified header, footer, panels, buttons and empty states.",
      "Improved mobile navigation, focus states and loading feedback.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-07-18",
    title: "Profile & Account Security",
    summary: "Users can manage personal information and important account security actions.",
    highlights: [
      "Added the Profile & Security page.",
      "Added forgot-password and password-reset flows.",
      "Added recoverable account deactivation in the backend.",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-07-18",
    title: "Player History & Scouting Reports",
    summary: "Scouting decisions and important player changes are easier to review over time.",
    highlights: [
      "Added structured scouting reports with ratings and decisions.",
      "Added player history for ELO, market value and club changes.",
      "Added watchlists and side-by-side player comparison.",
    ],
  },
]
