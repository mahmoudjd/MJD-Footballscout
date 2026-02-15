"use client"

import { useEffect, useState } from "react"
import { OutlineIcons } from "@/components/outline-icons"
import { SolidIcons } from "@/components/solid-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { hasSeenHelpGuide, markHelpGuideAsSeen } from "@/lib/cookies"

export interface GuideSection {
  id: string
  label: string
  description: string
  points: string[]
}

interface FeatureGuideProps {
  guideId: string
  title: string
  description: string
  sections: GuideSection[]
  triggerLabel?: string
}

export function FeatureGuide({
  guideId,
  title,
  description,
  sections,
  triggerLabel = "Help",
}: FeatureGuideProps) {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "overview")
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!hasSeenHelpGuide(guideId)) {
      setOpen(true)
    }
    setInitialized(true)
  }, [guideId])

  const markAsSeen = () => {
    markHelpGuideAsSeen(guideId)
    setOpen(false)
  }

  const reopenGuide = () => {
    setOpen(true)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={reopenGuide}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <OutlineIcons.QuestionMarkCircleIcon className="h-4 w-4 text-cyan-700" />
              <span>{triggerLabel}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Open quick usage guide for this page.</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {sections.length > 0 ? (
            <Tabs value={activeSection} onValueChange={setActiveSection} className="mt-4">
              <TabsList className="grid w-full grid-cols-1 gap-1 sm:grid-cols-3">
                {sections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map((section) => (
                <TabsContent key={section.id} value={section.id}>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">{section.description}</p>
                    <ul className="mt-3 space-y-2">
                      {section.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                          <SolidIcons.CheckCircleIcon className="mt-0.5 h-4 w-4 text-cyan-700" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : null}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={markAsSeen}
              disabled={!initialized}
              className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
            >
              Got it, do not auto-show
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
