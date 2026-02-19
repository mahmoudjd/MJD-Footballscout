import { Text } from "@/components/ui/text"

export function AuthDivider() {
  return (
    <div className="my-4 flex w-full items-center justify-between space-x-4">
      <hr className="flex-grow border-t border-slate-300" />
      <Text as="span" variant="body" tone="subtle">
        OR
      </Text>
      <hr className="flex-grow border-t border-slate-300" />
    </div>
  )
}
