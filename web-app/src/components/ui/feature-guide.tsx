"use client"

import { useEffect, useState } from "react"
import { OutlineIcons } from "@/components/outline-icons"
import { SolidIcons } from "@/components/solid-icons"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

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
            <Button type="button" onClick={reopenGuide} variant="outline" size="sm">
              <OutlineIcons.QuestionMarkCircleIcon className="h-4 w-4 text-cyan-700" />
              <Text as="span" weight="medium">
                {triggerLabel}
              </Text>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Open quick usage guide for this page.</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
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
                  <div
                    className={cn(
                      "rounded-lg border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4",
                    )}
                  >
                    <Text as="p" tone="muted">
                      {section.description}
                    </Text>
                    <ul className="mt-3 space-y-2">
                      {section.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <SolidIcons.CheckCircleIcon className="mt-0.5 h-4 w-4 text-cyan-700" />
                          <Text as="span" tone="muted">
                            {point}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : null}

          <DialogFooter>
            <Button type="button" onClick={() => setOpen(false)} variant="outline" size="md">
              Close
            </Button>
            <Button
              type="button"
              onClick={markAsSeen}
              disabled={!initialized}
              variant="primary"
              size="md"
            >
              Got it, do not auto-show
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
