"use client"

import { useState, useCallback, useMemo } from "react"
import { convert } from "@/lib/convert"
import { usePlayersQuery } from "@/features/players/hooks/usePlayersQuery"
import { usePlayerSearchMutation } from "@/features/search/hooks/usePlayerSearchMutation"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { PlayerType } from "@/lib/types/type"
import { SearchResultsList } from "@/features/search/components/search-results-list"
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
import { searchGuideSections } from "@/features/search/components/search-guide"
import { queryKeys } from "@/lib/react-query/query-keys"

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
      onSuccess: () => queryClient.refetchQueries({ queryKey: queryKeys.players.all }),
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
    <PageContainer className="space-y-5" size="wide">
      <SectionHeader
        title="Search Players"
        description="Search locally while typing and query fresh backend data on demand."
        icon="SparklesIcon"
        badge={
          name.trim() ? `${results.length} match${results.length === 1 ? "" : "es"}` : undefined
        }
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
        <form
          className="flex w-full flex-col items-stretch justify-center gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            handleSearch()
          }}
          role="search"
        >
          <label htmlFor="player-search" className="sr-only">
            Player name
          </label>
          <Input
            id="player-search"
            name="playerName"
            type="search"
            className="h-12 rounded-2xl px-4 py-2 text-stone-800"
            onChange={handleChange}
            value={name}
            placeholder="Enter player name…"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(validationMessage)}
            aria-describedby={validationMessage ? "player-search-error" : undefined}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="h-12 w-full rounded-2xl sm:w-40"
            disabled={isPending}
          >
            {isPending ? "Searching…" : "Search"}
          </Button>
        </form>

        {validationMessage && (
          <div id="player-search-error">
            <StatusState tone="error" title={validationMessage} />
          </div>
        )}
      </Panel>

      {isPending && (
        <Panel tone="soft">
          <StatusState
            tone="loading"
            title="Searching players"
            description="Please wait a moment."
          />
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
