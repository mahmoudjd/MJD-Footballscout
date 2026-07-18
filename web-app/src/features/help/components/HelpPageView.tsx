import Link from "next/link"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { ActionLink } from "@/components/ui/action-link"
import { Chip } from "@/components/ui/chip"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { Text } from "@/components/ui/text"
import { faqGroups, helpSteps, releaseNotes } from "@/features/help/content/help-content"

const releaseDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

const quickLinks = [
  {
    href: "#getting-started",
    title: "Getting Started",
    description: "Learn the core scouting workflow.",
    icon: "RocketLaunchIcon" as const,
  },
  {
    href: "#faq",
    title: "FAQ",
    description: "Find answers to common questions.",
    icon: "BookOpenIcon" as const,
  },
  {
    href: "#whats-new",
    title: "What’s New",
    description: "Review features and product changes.",
    icon: "MegaphoneIcon" as const,
  },
]

export function HelpPageView() {
  return (
    <PageContainer className="space-y-6" size="wide">
      <SectionHeader
        title="Help Center"
        description="Learn the scouting workflow, find quick answers and review the latest improvements."
        icon="QuestionMarkCircleIcon"
        badge="FAQ & Updates"
        level="h1"
      />

      <nav aria-label="Help topics" className="grid gap-3 sm:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = OutlineIcons[item.icon]
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-w-0 touch-manipulation items-start gap-3 rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-[0_18px_36px_-30px_rgba(15,50,36,0.4)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-emerald-700/25 hover:shadow-[0_20px_38px_-28px_rgba(15,50,36,0.5)] focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 transition-colors group-hover:bg-lime-200">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <Text as="span" weight="bold" className="block text-emerald-950">
                  {item.title}
                </Text>
                <Text
                  as="span"
                  variant="caption"
                  className="mt-1 block text-pretty text-emerald-950/60"
                >
                  {item.description}
                </Text>
              </span>
            </Link>
          )
        })}
      </nav>

      <section
        id="getting-started"
        className="scroll-mt-28 space-y-4"
        aria-labelledby="getting-started-title"
      >
        <div>
          <Text
            as="h2"
            id="getting-started-title"
            variant="h2"
            weight="extrabold"
            className="text-pretty text-emerald-950"
          >
            Getting Started
          </Text>
          <Text as="p" className="mt-1 max-w-3xl text-pretty text-emerald-950/60">
            Move from discovery to a structured shortlist in 4 simple steps.
          </Text>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {helpSteps.map((step, index) => (
            <li key={step.title} className="min-w-0">
              <Panel className="flex h-full flex-col" tone="soft">
                <div className="flex items-center justify-between gap-3">
                  <Chip tone="emerald">Step {index + 1}</Chip>
                  <span
                    className="text-3xl font-black text-emerald-950/10 tabular-nums"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <Text
                  as="h3"
                  variant="title"
                  weight="bold"
                  className="mt-4 text-pretty text-emerald-950"
                >
                  {step.title}
                </Text>
                <Text as="p" className="mt-2 flex-1 text-pretty text-emerald-950/65">
                  {step.description}
                </Text>
                <ActionLink
                  href={step.href}
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  className="mt-5 self-start"
                >
                  {step.action}
                </ActionLink>
              </Panel>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="scroll-mt-28 space-y-4" aria-labelledby="faq-title">
        <div>
          <Text
            as="h2"
            id="faq-title"
            variant="h2"
            weight="extrabold"
            className="text-pretty text-emerald-950"
          >
            Frequently Asked Questions
          </Text>
          <Text as="p" className="mt-1 max-w-3xl text-pretty text-emerald-950/60">
            Practical answers for player data, scouting workflows and account security.
          </Text>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-3">
          {faqGroups.map((group) => (
            <Panel key={group.title} className="space-y-4" spacing="compact">
              <div className="px-1">
                <Text
                  as="h3"
                  variant="title"
                  weight="bold"
                  className="text-pretty text-emerald-950"
                >
                  {group.title}
                </Text>
                <Text as="p" variant="caption" className="mt-1 text-pretty text-emerald-950/55">
                  {group.description}
                </Text>
              </div>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <details
                    key={item.id}
                    id={item.id}
                    className="group scroll-mt-28 rounded-2xl border border-emerald-950/10 bg-emerald-50/35 open:bg-white open:shadow-[0_16px_30px_-26px_rgba(15,50,36,0.45)]"
                  >
                    <summary className="flex min-h-12 cursor-pointer touch-manipulation list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 font-bold text-emerald-950 transition-colors hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 text-pretty">{item.question}</span>
                      <OutlineIcons.ChevronDownIcon
                        className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="border-t border-emerald-950/8 px-4 py-4">
                      <Text as="p" className="text-pretty text-emerald-950/70">
                        {item.answer}
                      </Text>
                      {item.tips?.length ? (
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-950/65">
                          {item.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section id="whats-new" className="scroll-mt-28 space-y-4" aria-labelledby="whats-new-title">
        <div>
          <Text
            as="h2"
            id="whats-new-title"
            variant="h2"
            weight="extrabold"
            className="text-pretty text-emerald-950"
          >
            What’s New
          </Text>
          <Text as="p" className="mt-1 max-w-3xl text-pretty text-emerald-950/60">
            A transparent record of new features and meaningful product improvements.
          </Text>
        </div>

        <div className="space-y-3">
          {releaseNotes.map((release) => {
            const releaseDate = new Date(`${release.date}T00:00:00.000Z`)
            return (
              <Panel
                key={release.version}
                tone={release.featured ? "soft" : "default"}
                className="overflow-hidden"
              >
                <article className="grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)]">
                  <div className="flex items-start justify-between gap-3 md:block">
                    <div>
                      <Chip tone={release.featured ? "success" : "neutral"}>
                        v{release.version}
                      </Chip>
                      <time
                        dateTime={release.date}
                        className="mt-2 block text-sm font-semibold text-emerald-950/55 tabular-nums"
                      >
                        {releaseDateFormatter.format(releaseDate)}
                      </time>
                    </div>
                    {release.featured ? <Chip tone="amber">Latest</Chip> : null}
                  </div>
                  <div className="min-w-0">
                    <Text
                      as="h3"
                      variant="title"
                      weight="bold"
                      className="text-pretty text-emerald-950"
                    >
                      {release.title}
                    </Text>
                    <Text as="p" className="mt-1 text-pretty text-emerald-950/65">
                      {release.summary}
                    </Text>
                    <ul className="mt-3 grid gap-2 text-sm text-emerald-950/70 sm:grid-cols-2">
                      {release.highlights.map((highlight) => (
                        <li key={highlight} className="flex min-w-0 items-start gap-2">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500"
                            aria-hidden="true"
                          />
                          <span className="text-pretty">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Panel>
            )
          })}
        </div>
      </section>
    </PageContainer>
  )
}
