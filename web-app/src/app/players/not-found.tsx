import { Text } from "@/components/ui/text"
import { ActionLink } from "@/components/ui/action-link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        <Text as="h2" variant="h1" weight="bold" className="tracking-tight">
          Players Not Found
        </Text>
        <Text as="p" variant="body-lg" tone="subtle" className="mt-4">
          Sorry, we couldn't find the player you're looking for.
        </Text>
        <div className="mt-10">
          <ActionLink href="/" size="md" fullWidth={false}>
            Go back home
          </ActionLink>
        </div>
      </div>
    </div>
  )
}
