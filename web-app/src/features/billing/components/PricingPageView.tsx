"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusState } from "@/components/ui/status-state"
import { Text } from "@/components/ui/text"
import { useBillingActions, useBillingStatus } from "@/features/billing/hooks/useBilling"
import { useToast } from "@/lib/hooks/useToast"

const premiumFeatures = [
  "Shadow Team formations, squad gaps and alternatives",
  "Recruitment Workspace, pipeline and decision tools",
  "Saved scouting workflows across your account",
  "Secure subscription management through Stripe",
]

function formattedDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-GB")
}

export function PricingPageView({ checkoutResult }: { checkoutResult?: "success" | "cancelled" }) {
  const { status: sessionStatus } = useSession()
  const authenticated = sessionStatus === "authenticated"
  const billingQuery = useBillingStatus(authenticated, checkoutResult === "success")
  const billing = billingQuery.data
  const actions = useBillingActions()
  const toast = useToast()
  const renewalDate = formattedDate(billing?.currentPeriodEnd)

  const redirectToCheckout = () => {
    actions.checkout.mutate(undefined, {
      onSuccess: (url) => window.location.assign(url),
      onError: () => toast.error("Checkout could not be started. Please try again."),
    })
  }

  const redirectToPortal = () => {
    actions.portal.mutate(undefined, {
      onSuccess: (url) => window.location.assign(url),
      onError: () => toast.error("Subscription management is currently unavailable."),
    })
  }

  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="MJD Scout Premium"
        description="Turn player data into a structured recruitment workflow."
        icon="SparklesIcon"
        badge={
          billing?.premiumEnabled === false
            ? "Unavailable"
            : billing?.isPremium
              ? "Active"
              : "Premium"
        }
      />

      {checkoutResult === "success" &&
      authenticated &&
      billing?.premiumEnabled &&
      !billing.isPremium ? (
        <Panel>
          <StatusState
            tone="loading"
            title="Confirming your Premium subscription…"
            description="Payment was completed. Access will unlock automatically as soon as the signed Stripe webhook is processed."
          />
        </Panel>
      ) : null}
      {checkoutResult === "cancelled" ? (
        <Panel>
          <StatusState
            title="Checkout was cancelled"
            description="No subscription change was made. You can continue whenever you are ready."
          />
        </Panel>
      ) : null}

      {authenticated && billingQuery.isLoading ? (
        <Panel>
          <StatusState tone="loading" title="Checking your subscription…" />
        </Panel>
      ) : null}
      {authenticated && billingQuery.isError ? (
        <Panel>
          <StatusState
            tone="error"
            title="Subscription status could not be loaded"
            description="Please check the backend connection and try again."
          />
        </Panel>
      ) : null}
      {authenticated && billing?.premiumEnabled === false ? (
        <Panel>
          <StatusState
            tone="empty"
            title="Premium is currently unavailable"
            description="Premium access and new subscriptions are disabled by the service administrator."
          />
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel tone="soft" className="overflow-hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950">
            <OutlineIcons.RocketLaunchIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <Text as="h2" variant="h1" weight="extrabold" className="mt-5 max-w-2xl text-balance">
            Professional scouting tools for clearer recruitment decisions.
          </Text>
          <Text as="p" variant="body" tone="muted" className="mt-3 max-w-2xl text-pretty">
            Premium combines squad planning and candidate management in one secure workspace.
          </Text>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {premiumFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-emerald-950/8 bg-white/85 p-3.5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <OutlineIcons.ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <Text as="span" variant="body" weight="semibold">
                  {feature}
                </Text>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="self-start border-emerald-900/15">
          <Text
            as="p"
            variant="caption"
            className="font-bold tracking-widest text-emerald-700 uppercase"
          >
            Premium plan
          </Text>
          <Text as="p" variant="h1" weight="extrabold" className="mt-2">
            Monthly subscription
          </Text>
          <Text as="p" variant="body" tone="muted" className="mt-2">
            The exact price and taxes are shown securely in Stripe Checkout.
          </Text>

          <div className="mt-6 border-t border-emerald-950/8 pt-6">
            {sessionStatus === "loading" ? (
              <Button fullWidth disabled>
                Checking account…
              </Button>
            ) : !authenticated ? (
              <Link
                href="/login?callbackUrl=%2Fpricing"
                className={buttonVariants({ variant: "secondary", size: "lg", fullWidth: true })}
              >
                Sign in to continue
              </Link>
            ) : billing?.premiumEnabled === false ? (
              <div className="space-y-3">
                <Button variant="secondary" size="lg" fullWidth disabled>
                  Premium currently unavailable
                </Button>
                {billing.canManageSubscription ? (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={redirectToPortal}
                    disabled={actions.portal.isPending}
                  >
                    {actions.portal.isPending ? "Opening portal…" : "Manage existing billing"}
                  </Button>
                ) : null}
              </div>
            ) : billing?.isPremium ? (
              <>
                <div className="mb-4 rounded-2xl bg-emerald-50 p-3.5">
                  <Text as="p" weight="bold" className="text-emerald-900">
                    Premium is active
                  </Text>
                  {renewalDate ? (
                    <Text as="p" variant="caption" tone="muted" className="mt-1">
                      {billing.cancelAtPeriodEnd ? "Access until" : "Next billing date"}:{" "}
                      {renewalDate}
                    </Text>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={redirectToPortal}
                  disabled={actions.portal.isPending || !billing.canManageSubscription}
                >
                  {actions.portal.isPending ? "Opening portal…" : "Manage subscription"}
                </Button>
              </>
            ) : (
              <div className="space-y-2.5">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={redirectToCheckout}
                  disabled={actions.checkout.isPending || billingQuery.isLoading}
                >
                  {actions.checkout.isPending ? "Opening secure checkout…" : "Upgrade with Stripe"}
                </Button>
                {billing?.canManageSubscription ? (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={redirectToPortal}
                    disabled={actions.portal.isPending}
                  >
                    {actions.portal.isPending ? "Opening portal…" : "Manage billing"}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
          <Text as="p" variant="caption" tone="muted" className="mt-4 text-center">
            Payments and subscription management are handled by Stripe.
          </Text>
        </Panel>
      </div>
    </PageContainer>
  )
}
