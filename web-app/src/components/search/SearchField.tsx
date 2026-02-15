"use client"

import { useState, useCallback, useMemo } from "react"
import { convert } from "@/lib/convert"
import { useGetPlayers } from "@/lib/hooks/queries/use-get-players"
import { useSearchPlayers } from "@/lib/hooks/mutations/use-search-players"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { PlayerType } from "@/lib/types/type"
import { Spinner } from "@/components/spinner"
import { SearchResultsList } from "@/components/search/search-results-list"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/lib/hooks/use-toast"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusState } from "@/components/ui/status-state"
import { PageContainer } from "@/components/ui/page-container"
import { FeatureGuide, type GuideSection } from "@/components/ui/feature-guide"

const searchGuideSections: GuideSection[] = [
  {
    id: "type",
    label: "1. Type",
    description: "Start typing a player name to get instant local suggestions.",
    points: [
      "Local matching updates while you type.",
      "Use at least 3 characters for backend search.",
      "Try full name or short name for better matching.",
    ],
  },
  {
    id: "search",
    label: "2. Search",
    description: "Run a server-side search to fetch fresh results.",
    points: [
      "Click Search or press Enter.",
      "If you are not logged in, you will be redirected to login first.",
      "The app refreshes players cache after successful search.",
    ],
  },
  {
    id: "review",
    label: "3. Review",
    description: "Use the result list to open profiles and continue scouting.",
    points: [
      "Empty state helps when no players match your query.",
      "Loading state shows ongoing server processing.",
      "Open player cards to inspect details faster.",
    ],
  },
]

export function SearchField() {
  const { data: players, error, isError } = useGetPlayers()
  const [name, setName] = useState("")
  const [showServerResults, setShowServerResults] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const queryClient = useQueryClient()
  const debouncedName = useDebounce(convert(name.trim()), 300)
  const router = useRouter()
  const { data: session } = useSession()
  const toast = useToast()
  const loggedIn = !!session?.user?.email

  if (isError) {
    throw error
  }

  const localResults = useMemo(() => {
    if (!players || debouncedName.length === 0) return []

    const searchTerm = debouncedName.toLowerCase()
    return players?.filter((player) =>
      [player.name, player.fullName]
        .map((p) => convert(p).toLowerCase())
        .some((p) => p.includes(searchTerm)),
    )
  }, [players, debouncedName])

  const {
    mutate,
    data: serverResults,
    isPending,
    error: searchingError,
    isError: isSearchingError,
  } = useSearchPlayers()

  if (isSearchingError) {
    throw searchingError
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setShowServerResults(false)
    setHasSearched(false)
    setValidationMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSearch = useCallback(() => {
    if (!loggedIn) {
      router.push("/login?callbackUrl=" + encodeURIComponent("/search"))
      return
    }
    const query = convert(name.trim())

    if (query.length < 3) {
      const message = "Please enter at least 3 characters."
      setValidationMessage(message)
      toast.info(message)
      return
    }

    setValidationMessage("")
    setHasSearched(true)
    setShowServerResults(true)
    mutate(query, {
      onSuccess: () => queryClient.refetchQueries({ queryKey: ["players"] }),
    })
  }, [name, mutate, loggedIn, router, queryClient, toast])

  const results: PlayerType[] = showServerResults ? (serverResults ?? []) : localResults

  return (
    <PageContainer className="space-y-4" size="narrow">
      <SectionHeader
        title="Search Players"
        description="Search locally while typing and query fresh backend data on demand."
        right={
          <FeatureGuide
            guideId="search"
            title="How Search Works"
            description="This page supports fast local filtering plus on-demand backend search."
            sections={searchGuideSections}
            triggerLabel="Search help"
          />
        }
      />

      <Panel className="space-y-3">
        <div className="flex w-full flex-col items-stretch justify-center gap-2 sm:flex-row">
          <input
            type="search"
            className="h-12 w-full rounded-xl border border-cyan-600 bg-white px-4 py-2 transition focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={name}
            placeholder="Enter player name..."
          />
          <button
            className="h-12 w-full cursor-pointer rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-500 sm:w-40"
            onClick={handleSearch}
            disabled={isPending}
          >
            {isPending ? "Searching..." : "Search"}
          </button>
        </div>

        {validationMessage && <StatusState tone="error" title={validationMessage} />}
      </Panel>

      {isPending && (
        <Panel>
          <StatusState
            tone="loading"
            title="Searching players"
            description="Please wait a moment."
          />
          <Spinner size="md" label="Searching..." />
        </Panel>
      )}

      {hasSearched && results.length === 0 && !isPending ? (
        <Panel>
          <StatusState
            tone="empty"
            title="No matching players found"
            description="Please check the spelling and try again."
          />
        </Panel>
      ) : (
        <SearchResultsList players={results} />
      )}
    </PageContainer>
  )
}
