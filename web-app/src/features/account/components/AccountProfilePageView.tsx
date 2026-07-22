"use client"

import { type ComponentType, type FormEvent, type SVGProps, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CalendarDaysIcon,
  BellAlertIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  InformationCircleIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import {
  changeAccountPassword,
  deactivateAccount,
  getAccountProfile,
  updateAccountProfile,
  updateNotificationPreferences,
  startMfaSetup,
  enableMfa,
  disableMfa,
  type MfaSetupResponse,
} from "@/features/account/accountApi"
import { queryKeys } from "@/lib/react-query/query-keys"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Text } from "@/components/ui/text"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/common/spinner"
import { StatusState } from "@/components/ui/status-state"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/lib/hooks/useToast"
import { cn } from "@/lib/cn"

const accountDateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" })
const validTabs = new Set(["overview", "security", "danger"])

type AccountIcon = ComponentType<SVGProps<SVGSVGElement>>

interface AccountFactProps {
  label: string
  value: string
  icon: AccountIcon
}

function AccountFact({ label, value, icon: Icon }: AccountFactProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-950/8 bg-white/80 p-3.5 shadow-[0_14px_28px_-25px_rgba(15,50,36,0.5)]">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <Text as="p" variant="overline" className="text-emerald-950/45">
          {label}
        </Text>
        <Text
          as="p"
          weight="bold"
          className="mt-0.5 truncate text-emerald-950 capitalize"
          title={value}
        >
          {value}
        </Text>
      </div>
    </div>
  )
}

function SectionIntro({
  title,
  description,
  icon: Icon,
  tone = "default",
}: {
  title: string
  description: string
  icon: AccountIcon
  tone?: "default" | "danger"
}) {
  const danger = tone === "danger"
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
          danger
            ? "border-red-200 bg-red-100 text-red-700"
            : "border-emerald-200 bg-emerald-100 text-emerald-800",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <Text
          as="h2"
          variant="h3"
          weight="bold"
          className={danger ? "text-red-900" : "text-emerald-950"}
        >
          {title}
        </Text>
        <Text
          as="p"
          className={cn("mt-1 max-w-2xl", danger ? "text-red-900/65" : "text-emerald-950/60")}
        >
          {description}
        </Text>
      </div>
    </div>
  )
}

function SecurityPoint({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-emerald-950/8 bg-white/75 p-3.5">
      <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
      <div className="min-w-0">
        <Text as="p" weight="bold" className="text-emerald-950">
          {title}
        </Text>
        <Text as="p" variant="caption" className="mt-1 text-emerald-950/60">
          {description}
        </Text>
      </div>
    </li>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const score =
    Number(password.length >= 8) +
    Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) +
    Number(/[0-9!@#$%^&*(),.?":{}|<>]/.test(password))
  const label =
    password.length === 0
      ? "Enter a new password"
      : score === 3
        ? "Strong"
        : score === 2
          ? "Good"
          : "Needs more strength"

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-colors",
              score >= step
                ? score === 3
                  ? "bg-emerald-600"
                  : "bg-lime-500"
                : "bg-emerald-950/10",
            )}
          />
        ))}
      </div>
      <Text as="p" variant="caption" className="text-emerald-950/55">
        Password strength: <span className="font-bold text-emerald-800">{label}</span>
      </Text>
    </div>
  )
}

export function AccountProfilePageView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: session, status, update } = useSession()
  const requestedTab = searchParams.get("tab") || "overview"
  const activeTab = validTabs.has(requestedTab) ? requestedTab : "overview"
  const [name, setName] = useState<string | null>(null)
  const [profileError, setProfileError] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deactivationPassword, setDeactivationPassword] = useState("")
  const [deactivationReason, setDeactivationReason] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [deactivationError, setDeactivationError] = useState("")
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [mfaPassword, setMfaPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [mfaSetup, setMfaSetup] = useState<MfaSetupResponse | null>(null)
  const [mfaRecoveryCodes, setMfaRecoveryCodes] = useState<string[]>([])
  const [mfaError, setMfaError] = useState("")

  const profileQuery = useQuery({
    queryKey: queryKeys.account.profile,
    queryFn: getAccountProfile,
    enabled: status === "authenticated",
  })
  const profile = profileQuery.data
  const savedName = profile?.name ?? session?.user.name ?? ""
  const resolvedName = name ?? savedName
  const displayName = resolvedName.trim() || "Account"
  const profileIsDirty = resolvedName.trim() !== savedName.trim()
  const provider = profile?.authProvider || "credentials"
  const providerLabel = provider === "google" ? "Google" : "Email & Password"
  const memberSince = profile?.createdAt
    ? accountDateFormatter.format(new Date(profile.createdAt))
    : "—"

  const updateProfileMutation = useMutation({
    mutationFn: () => updateAccountProfile(resolvedName.trim()),
    onSuccess: async (updatedProfile) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.account.profile }),
        update({ name: updatedProfile.name }),
      ])
      setName(null)
      toast.success("Profile updated successfully.")
    },
    onError: () => setProfileError("Profile could not be updated. Please try again."),
  })

  const changePasswordMutation = useMutation({
    mutationFn: changeAccountPassword,
    onSuccess: async () => {
      toast.success("Password changed. Please sign in again.")
      await signOut({ callbackUrl: "/login?passwordChanged=1" })
    },
    onError: (error) => setPasswordError(error.message),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateAccount,
    onSuccess: async () => {
      toast.success("Your account has been deactivated.")
      await signOut({ callbackUrl: "/login?accountDeactivated=1" })
    },
    onError: (error) => {
      setDeactivateDialogOpen(false)
      setDeactivationError(error.message)
    },
  })

  const notificationMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.profile })
      toast.success("Email preferences updated.")
    },
    onError: () => toast.error("Email preferences could not be updated."),
  })

  const mfaSetupMutation = useMutation({
    mutationFn: startMfaSetup,
    onSuccess: (setup) => {
      setMfaSetup(setup)
      setMfaCode("")
      setMfaError("")
    },
    onError: (error) => setMfaError(error.message),
  })

  const mfaEnableMutation = useMutation({
    mutationFn: enableMfa,
    onSuccess: async (result) => {
      setMfaRecoveryCodes(result.recoveryCodes)
      setMfaSetup(null)
      setMfaCode("")
      setMfaPassword("")
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.profile })
      toast.success("Multi-factor authentication enabled.")
    },
    onError: (error) => setMfaError(error.message),
  })

  const mfaDisableMutation = useMutation({
    mutationFn: disableMfa,
    onSuccess: async () => {
      setMfaCode("")
      setMfaPassword("")
      setMfaError("")
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.profile })
      toast.success("Multi-factor authentication disabled.")
    },
    onError: (error) => setMfaError(error.message),
  })

  const changeTab = (value: string) => {
    if (!validTabs.has(value) || value === activeTab) return
    router.replace(`/profile?tab=${value}`, { scroll: false })
  }

  const copyRecoveryCodes = async () => {
    try {
      await navigator.clipboard.writeText(mfaRecoveryCodes.join("\n"))
      toast.success("Recovery codes copied.")
    } catch {
      toast.error("Recovery codes could not be copied. Copy them manually instead.")
    }
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileError("")
    if (!resolvedName.trim()) {
      setProfileError("Enter the display name you want to use.")
      return
    }
    if (!profileIsDirty) {
      toast.info("Your profile is already up to date.")
      return
    }
    updateProfileMutation.mutate()
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError("")
    if (!currentPassword) {
      setPasswordError("Enter your current password to continue.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Use at least 8 characters for your new password.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  const requestDeactivation = () => {
    setDeactivationError("")
    if (provider !== "google" && !deactivationPassword) {
      setDeactivationError("Enter your current password before deactivating your account.")
      return
    }
    setDeactivateDialogOpen(true)
  }

  if (status === "loading") {
    return (
      <PageContainer size="narrow">
        <StatusState tone="loading" title="Loading Profile…" />
      </PageContainer>
    )
  }

  if (status !== "authenticated") {
    return (
      <PageContainer size="narrow">
        <LoginRequiredState
          callbackUrl="/profile"
          description="Sign in to manage your profile and security settings."
        />
      </PageContainer>
    )
  }

  if (profileQuery.isError) throw profileQuery.error

  return (
    <PageContainer size="wide" className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-5 text-white shadow-[0_30px_70px_-34px_rgba(6,78,59,0.72)] sm:p-7 lg:p-8">
        <div
          className="pointer-events-none absolute -top-28 -right-16 h-72 w-72 rounded-full bg-lime-300/12"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-36 -left-20 h-64 w-64 rounded-full border border-white/8 bg-white/5"
          aria-hidden="true"
        />
        <div className="relative grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="relative mx-auto lg:mx-0">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl border border-lime-200/30 bg-lime-300/15 text-4xl font-extrabold text-lime-100 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)] backdrop-blur-sm sm:h-28 sm:w-28">
              {displayName.charAt(0).toUpperCase() || "A"}
            </div>
            <span
              className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-4 border-emerald-900 bg-lime-300"
              aria-label="Account active"
            />
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <Text as="p" variant="overline" weight="bold" className="text-lime-200">
              Your Account Center
            </Text>
            <Text as="h1" variant="h1" weight="extrabold" className="mt-2 break-words text-white">
              {displayName}
            </Text>
            <Text as="p" className="mt-2 break-all text-emerald-50/70">
              {profile?.email || session.user.email}
            </Text>
            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-lime-100">
                <CheckBadgeIcon className="h-4 w-4" aria-hidden="true" /> Active
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
                <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" /> {providerLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 capitalize">
                <IdentificationIcon className="h-4 w-4" aria-hidden="true" />{" "}
                {profile?.role || session.user.role}
              </span>
            </div>
          </div>

          <div className="hidden max-w-60 rounded-2xl border border-white/12 bg-black/10 p-4 backdrop-blur-sm lg:block">
            <Text as="p" variant="overline" className="text-lime-200/80">
              Account Status
            </Text>
            <Text as="p" weight="bold" className="mt-2 text-white">
              Protected & Active
            </Text>
            <Text as="p" variant="caption" className="mt-1 text-white/60">
              Manage your identity and security from one place.
            </Text>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={changeTab}>
        <div className="sticky top-17 z-30 rounded-2xl border border-emerald-950/8 bg-[#f5f7f4]/92 p-1.5 shadow-[0_18px_36px_-30px_rgba(15,50,36,0.55)] backdrop-blur-lg sm:top-20">
          <TabsList className="grid w-full grid-cols-3 gap-1.5 border-0 bg-transparent p-0">
            <TabsTrigger value="overview" className="gap-2 rounded-xl">
              <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Profile Overview</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 rounded-xl">
              <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" /> Security
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2 rounded-xl data-[state=active]:bg-red-700">
              <TrashIcon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Deactivate Account</span>
              <span className="sm:hidden">Account</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <Panel className="overflow-hidden p-0">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6 p-4 sm:p-6 lg:p-7">
                <SectionIntro
                  title="Personal Information"
                  description="Control the identity displayed throughout your scouting workspace."
                  icon={UserCircleIcon}
                />
                {profileQuery.isLoading ? (
                  <StatusState tone="loading" title="Loading Account Details…" />
                ) : (
                  <form className="max-w-2xl space-y-5" onSubmit={handleProfileSubmit} noValidate>
                    <FormField
                      label="Display Name"
                      htmlFor="account-name"
                      error={profileError}
                      hint={
                        !profileError
                          ? "This name appears in your account menu and activity."
                          : undefined
                      }
                      required
                    >
                      <Input
                        id="account-name"
                        name="name"
                        autoComplete="name"
                        value={resolvedName}
                        onChange={(event) => {
                          setProfileError("")
                          setName(event.target.value)
                        }}
                        placeholder="Example: Alex Morgan…"
                        maxLength={80}
                        required
                        aria-invalid={Boolean(profileError)}
                        aria-describedby={profileError ? "account-name-error" : "account-name-hint"}
                      />
                    </FormField>
                    <FormField
                      label="Email Address"
                      htmlFor="account-email"
                      hint="Your sign-in provider manages this email address."
                    >
                      <Input
                        id="account-email"
                        name="email"
                        type="email"
                        value={profile?.email || ""}
                        readOnly
                        disabled
                      />
                    </FormField>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending || !profileIsDirty}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Spinner size="sm" tone="light" /> Saving…
                          </>
                        ) : (
                          "Save Profile Changes"
                        )}
                      </Button>
                      {profileIsDirty ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setName(null)
                            setProfileError("")
                          }}
                        >
                          Discard Changes
                        </Button>
                      ) : (
                        <Text as="p" variant="caption" className="px-2 text-emerald-950/50">
                          Your profile is up to date.
                        </Text>
                      )}
                    </div>
                  </form>
                )}
              </div>

              <aside
                className="border-t border-emerald-950/8 bg-linear-to-br from-emerald-50/70 to-lime-50/45 p-4 sm:p-6 lg:border-t-0 lg:border-l lg:p-7"
                aria-label="Account snapshot"
              >
                <Text as="h2" variant="title" weight="bold" className="text-emerald-950">
                  Account Snapshot
                </Text>
                <Text as="p" variant="caption" className="mt-1 text-emerald-950/55">
                  Your membership and sign-in details.
                </Text>
                <div className="mt-5 space-y-3">
                  <AccountFact
                    label="Role"
                    value={profile?.role || session.user.role}
                    icon={IdentificationIcon}
                  />
                  <AccountFact label="Sign-In" value={providerLabel} icon={LockClosedIcon} />
                  <AccountFact label="Member Since" value={memberSince} icon={CalendarDaysIcon} />
                  <AccountFact
                    label="Email"
                    value={profile?.email || session.user.email || "—"}
                    icon={EnvelopeIcon}
                  />
                </div>
              </aside>
            </div>
          </Panel>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Panel className="space-y-5">
              <SectionIntro
                title="Multi-Factor Authentication"
                description="Add an authenticator app as a second sign-in step."
                icon={DevicePhoneMobileIcon}
              />
              {provider === "google" ? (
                <StatusState
                  tone="empty"
                  title="MFA Managed by Google"
                  description="Configure two-step verification in your Google Account. Your MJD sign-in inherits that protection."
                />
              ) : mfaRecoveryCodes.length > 0 ? (
                <div className="space-y-4 rounded-2xl border border-lime-300 bg-lime-50 p-4">
                  <Text as="p" weight="bold" className="text-emerald-950">
                    Save your recovery codes now
                  </Text>
                  <Text as="p" variant="caption" className="text-emerald-950/65">
                    Each code works once. They will not be shown again.
                  </Text>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {mfaRecoveryCodes.map((code) => (
                      <code key={code} className="rounded-lg bg-white px-2 py-1.5 text-center">
                        {code}
                      </code>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copyRecoveryCodes()}
                  >
                    Copy Recovery Codes
                  </Button>
                </div>
              ) : profile?.mfaEnabled ? (
                <div className="space-y-4">
                  <StatusState
                    tone="empty"
                    title="MFA is active"
                    description="Your authenticator app or a recovery code is required at sign-in."
                  />
                  <FormField
                    label="Authentication or Recovery Code"
                    htmlFor="mfa-disable-code"
                    required
                  >
                    <Input
                      id="mfa-disable-code"
                      autoComplete="one-time-code"
                      value={mfaCode}
                      onChange={(event) => {
                        setMfaError("")
                        setMfaCode(event.target.value)
                      }}
                      placeholder="123456 or ABCDE-FGHIJ…"
                    />
                  </FormField>
                  <FormField label="Current Password" htmlFor="mfa-disable-password" required>
                    <Input
                      id="mfa-disable-password"
                      type="password"
                      autoComplete="current-password"
                      value={mfaPassword}
                      onChange={(event) => setMfaPassword(event.target.value)}
                      placeholder="Confirm your password…"
                    />
                  </FormField>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={mfaDisableMutation.isPending || !mfaCode}
                    onClick={() =>
                      mfaDisableMutation.mutate({
                        code: mfaCode,
                        password: mfaPassword || undefined,
                      })
                    }
                  >
                    {mfaDisableMutation.isPending ? (
                      <>
                        <Spinner size="sm" tone="light" /> Disabling…
                      </>
                    ) : (
                      "Disable MFA"
                    )}
                  </Button>
                </div>
              ) : mfaSetup ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <Text as="p" weight="bold">
                      Add the setup key to your authenticator app
                    </Text>
                    <code className="mt-3 block rounded-xl bg-white p-3 text-sm font-bold tracking-wider break-all">
                      {mfaSetup.secret}
                    </code>
                    <a
                      className="mt-3 inline-flex text-sm font-bold text-emerald-800 underline underline-offset-4"
                      href={mfaSetup.otpAuthUrl}
                    >
                      Open Authenticator App
                    </a>
                  </div>
                  <FormField label="6-Digit Authentication Code" htmlFor="mfa-enable-code" required>
                    <Input
                      id="mfa-enable-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(event) => {
                        setMfaError("")
                        setMfaCode(event.target.value)
                      }}
                      placeholder="123456…"
                    />
                  </FormField>
                  <Button
                    type="button"
                    disabled={mfaEnableMutation.isPending || mfaCode.length !== 6}
                    onClick={() => mfaEnableMutation.mutate(mfaCode)}
                  >
                    {mfaEnableMutation.isPending ? (
                      <>
                        <Spinner size="sm" tone="light" /> Verifying…
                      </>
                    ) : (
                      "Verify & Enable MFA"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <StatusState
                    tone="empty"
                    title="MFA is not enabled"
                    description="Use any TOTP-compatible app such as Google Authenticator, 1Password or Authy."
                  />
                  <FormField label="Current Password" htmlFor="mfa-setup-password" required>
                    <Input
                      id="mfa-setup-password"
                      type="password"
                      autoComplete="current-password"
                      value={mfaPassword}
                      onChange={(event) => {
                        setMfaError("")
                        setMfaPassword(event.target.value)
                      }}
                      placeholder="Confirm your password…"
                    />
                  </FormField>
                  <Button
                    type="button"
                    disabled={mfaSetupMutation.isPending || !mfaPassword}
                    onClick={() => mfaSetupMutation.mutate(mfaPassword || undefined)}
                  >
                    {mfaSetupMutation.isPending ? (
                      <>
                        <Spinner size="sm" tone="light" /> Preparing…
                      </>
                    ) : (
                      "Set Up Authenticator"
                    )}
                  </Button>
                </div>
              )}
              {mfaError ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                >
                  {mfaError}
                </p>
              ) : null}
            </Panel>

            <Panel className="space-y-5">
              <SectionIntro
                title="Email Notifications"
                description="Control important account and security alerts."
                icon={BellAlertIcon}
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-950/10 bg-emerald-50/45 p-4">
                <Input
                  type="checkbox"
                  className="mt-1 h-5 min-h-0 w-5 rounded-sm p-0 accent-emerald-700 shadow-none"
                  checked={profile?.securityEmailsEnabled ?? true}
                  disabled={notificationMutation.isPending}
                  onChange={(event) =>
                    notificationMutation.mutate({ securityEmailsEnabled: event.target.checked })
                  }
                />
                <span>
                  <Text as="span" weight="bold">
                    Account and security emails
                  </Text>
                  <Text as="span" variant="caption" className="mt-1 block text-emerald-950/60">
                    Receive alerts for password changes, MFA changes and other security-sensitive
                    actions.
                  </Text>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-950/10 bg-emerald-50/45 p-4">
                <Input
                  type="checkbox"
                  className="mt-1 h-5 min-h-0 w-5 rounded-sm p-0 accent-emerald-700 shadow-none"
                  checked={profile?.onboardingEmailsEnabled ?? true}
                  disabled={notificationMutation.isPending}
                  onChange={(event) =>
                    notificationMutation.mutate({ onboardingEmailsEnabled: event.target.checked })
                  }
                />
                <span>
                  <Text as="span" weight="bold">
                    Getting-started emails
                  </Text>
                  <Text as="span" variant="caption" className="mt-1 block text-emerald-950/60">
                    Receive two short guides about watchlists and recruitment planning.
                  </Text>
                </span>
              </label>
              <div className="rounded-2xl border border-emerald-950/8 bg-white p-4">
                <Text as="p" variant="overline" className="text-emerald-950/45">
                  Email status
                </Text>
                <Text as="p" weight="bold" className="mt-1 text-emerald-950">
                  {profile?.emailVerified ? "Verified" : "Verification required"}
                </Text>
                <Text as="p" variant="caption" className="mt-1 break-all text-emerald-950/60">
                  {profile?.email}
                </Text>
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Panel className="overflow-hidden p-0">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6 p-4 sm:p-6 lg:p-7">
                <SectionIntro
                  title="Password & Security"
                  description="Protect your account and invalidate old sessions when your password changes."
                  icon={ShieldCheckIcon}
                />
                {provider === "google" ? (
                  <StatusState
                    tone="empty"
                    title="Password Managed by Google"
                    description="Open your Google Account settings to update your password. Your MJD profile stays connected automatically."
                  />
                ) : (
                  <form className="max-w-2xl space-y-5" onSubmit={handlePasswordSubmit} noValidate>
                    <FormField label="Current Password" htmlFor="current-password" required>
                      <Input
                        id="current-password"
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => {
                          setPasswordError("")
                          setCurrentPassword(event.target.value)
                        }}
                        placeholder="Enter your current password…"
                        required
                      />
                    </FormField>
                    <FormField
                      label="New Password"
                      htmlFor="new-password"
                      hint="Use 8 or more characters with mixed character types."
                      required
                    >
                      <Input
                        id="new-password"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onChange={(event) => {
                          setPasswordError("")
                          setNewPassword(event.target.value)
                        }}
                        placeholder="Create a strong password…"
                        required
                        aria-invalid={Boolean(passwordError)}
                        aria-describedby={
                          passwordError ? "password-form-error" : "new-password-hint"
                        }
                      />
                    </FormField>
                    <PasswordStrength password={newPassword} />
                    <FormField label="Confirm New Password" htmlFor="confirm-password" required>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={confirmPassword}
                        onChange={(event) => {
                          setPasswordError("")
                          setConfirmPassword(event.target.value)
                        }}
                        placeholder="Repeat your new password…"
                        required
                        aria-invalid={Boolean(passwordError)}
                        aria-describedby={passwordError ? "password-form-error" : undefined}
                      />
                    </FormField>
                    {passwordError ? (
                      <p
                        id="password-form-error"
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                      >
                        {passwordError}
                      </p>
                    ) : null}
                    <Button type="submit" disabled={changePasswordMutation.isPending}>
                      {changePasswordMutation.isPending ? (
                        <>
                          <Spinner size="sm" tone="light" /> Changing…
                        </>
                      ) : (
                        <>
                          <KeyIcon className="h-4 w-4" aria-hidden="true" /> Change Password & Sign
                          Out
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              <aside
                className="border-t border-emerald-950/8 bg-linear-to-br from-emerald-50/70 to-white p-4 sm:p-6 lg:border-t-0 lg:border-l lg:p-7"
                aria-label="Security guidance"
              >
                <Text as="h2" variant="title" weight="bold" className="text-emerald-950">
                  Security Checklist
                </Text>
                <ul className="mt-5 space-y-3">
                  <SecurityPoint
                    title="Unique Password"
                    description="Do not reuse a password from another account."
                  />
                  <SecurityPoint
                    title="Sessions Reset"
                    description="A password change signs out every active session."
                  />
                  <SecurityPoint
                    title="Private Credentials"
                    description="MJD Football Scout never asks for your password by email."
                  />
                </ul>
              </aside>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="danger">
          <Panel className="overflow-hidden border-red-200 bg-white p-0">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6 p-4 sm:p-6 lg:p-7">
                <SectionIntro
                  title="Deactivate Account"
                  description="Disable access without deleting your database record."
                  icon={TrashIcon}
                  tone="danger"
                />
                <div className="max-w-2xl space-y-5">
                  {provider !== "google" ? (
                    <FormField label="Current Password" htmlFor="deactivation-password" required>
                      <Input
                        id="deactivation-password"
                        name="deactivationPassword"
                        type="password"
                        autoComplete="current-password"
                        value={deactivationPassword}
                        onChange={(event) => {
                          setDeactivationError("")
                          setDeactivationPassword(event.target.value)
                        }}
                        placeholder="Confirm with your password…"
                        required
                        aria-invalid={Boolean(deactivationError)}
                        aria-describedby={deactivationError ? "deactivation-error" : undefined}
                      />
                    </FormField>
                  ) : null}
                  <FormField
                    label="Reason (Optional)"
                    htmlFor="deactivation-reason"
                    hint={`${deactivationReason.length}/300 characters`}
                  >
                    <Textarea
                      id="deactivation-reason"
                      name="deactivationReason"
                      autoComplete="off"
                      value={deactivationReason}
                      onChange={(event) => setDeactivationReason(event.target.value)}
                      placeholder="Tell us why you are leaving…"
                      maxLength={300}
                    />
                  </FormField>
                  {deactivationError ? (
                    <p
                      id="deactivation-error"
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                    >
                      {deactivationError}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deactivateMutation.isPending}
                    onClick={requestDeactivation}
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" /> Deactivate My Account
                  </Button>
                </div>
              </div>

              <aside
                className="border-t border-red-200 bg-linear-to-br from-red-50 to-white p-4 sm:p-6 lg:border-t-0 lg:border-l lg:p-7"
                aria-label="Deactivation information"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <Text as="h2" variant="title" weight="bold" className="mt-4 text-red-900">
                  What Happens Next?
                </Text>
                <ul className="mt-4 space-y-3 text-sm text-red-900/70">
                  <li className="flex gap-2">
                    <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{" "}
                    You are signed out immediately.
                  </li>
                  <li className="flex gap-2">
                    <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{" "}
                    Future sign-in attempts are blocked.
                  </li>
                  <li className="flex gap-2">
                    <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{" "}
                    Your account remains marked as deactivated in the database.
                  </li>
                </ul>
              </aside>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        title="Deactivate Your Account?"
        description="You will be signed out immediately. Your account remains stored but cannot be used to sign in."
        confirmLabel="Deactivate Account"
        onConfirm={() =>
          deactivateMutation.mutate({
            password: deactivationPassword || undefined,
            reason: deactivationReason.trim() || undefined,
          })
        }
        isConfirming={deactivateMutation.isPending}
      />
    </PageContainer>
  )
}
