"use client"

import { useState, useCallback, useMemo } from "react"
import { convert } from "@/lib/convert"
import { usePlayersQuery } from "@/lib/hooks/queries/usePlayersQuery"
import { usePlayerSearchMutation } from "@/lib/hooks/mutations/usePlayerSearchMutation"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { PlayerType } from "@/lib/types/type"
import { Spinner } from "@/components/spinner"
import { SearchResultsList } from "@/components/search/search-results-list"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/lib/hooks/useToast"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusState } from "@/components/ui/status-state"
import { PageContainer } from "@/components/ui/page-container"
import { FeatureGuide } from "@/components/ui/feature-guide"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchGuideSections } from "@/components/search/search-guide"

export function PlayerSearchPanel() {
  const { data: players, error, isError } = usePlayersQuery()
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
  } = usePlayerSearchMutation()

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

  if (isError && error) {
    throw error
  }

  if (isSearchingError && searchingError) {
    throw searchingError
  }

  const results: PlayerType[] = showServerResults ? (serverResults ?? []) : localResults

  return (
    <PageContainer className="space-y-4" size="narrow">
      <SectionHeader
        title="Search Players"
        description="Search locally while typing and query fresh backend data on demand."
        icon="SparklesIcon"
        badge={name.trim() ? `${results.length} match${results.length === 1 ? "" : "es"}` : undefined}
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

      <Panel tone="soft" className="space-y-3">
        <div className="flex w-full flex-col items-stretch justify-center gap-2 sm:flex-row">
          <Input
            type="search"
            className="h-12 rounded-2xl px-4 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-400/40"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={name}
            placeholder="Enter player name..."
          />
          <Button
            variant="primary"
            size="md"
            className="h-12 w-full rounded-2xl sm:w-40"
            onClick={handleSearch}
            disabled={isPending}
          >
            {isPending ? "Searching..." : "Search"}
          </Button>
        </div>

        {validationMessage && <StatusState tone="error" title={validationMessage} />}
      </Panel>

      {isPending && (
        <Panel tone="soft">
          <StatusState
            tone="loading"
            title="Searching players"
            description="Please wait a moment."
          />
          <Spinner size="md" label="Searching..." />
        </Panel>
      )}

      {hasSearched && results.length === 0 && !isPending ? (
        <Panel tone="soft">
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
