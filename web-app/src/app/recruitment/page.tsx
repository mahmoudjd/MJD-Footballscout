import type { Metadata } from "next"
import { RecruitmentWorkspacePageView } from "@/features/recruitment/components/RecruitmentWorkspacePageView"

export const metadata: Metadata = {
  title: "Recruitment Workspace | MJD Football Scout",
  description: "Manage recruitment candidates from discovery to negotiation.",
}

export default function RecruitmentPage() {
  return <RecruitmentWorkspacePageView />
}
