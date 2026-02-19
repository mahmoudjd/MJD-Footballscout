import toast, { ToastOptions } from "react-hot-toast"
import { OutlineIcons } from "@/components/outline-icons"
import { SolidIcons } from "@/components/solid-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

const baseStyles = "rounded-md px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-sm"
const variants = {
  info: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
}

const icons = {
  info: <OutlineIcons.InformationCircleIcon className="h-5 w-5 text-yellow-600" />,
  success: <SolidIcons.CheckCircleIcon className="h-5 w-5 text-green-600" />,
  error: <SolidIcons.ExclamationTriangleIcon className="h-5 w-5 text-red-600" />,
}

function showCustomToast(
  type: "info" | "success" | "error",
  message: string,
  options?: ToastOptions,
) {
  toast.custom(
    (t) => (
      <div
        className={cn(
          baseStyles,
          variants[type],
          t.visible ? "animate-enter" : "animate-leave",
          "w-full max-w-sm",
        )}
      >
        <div className="flex items-center gap-2">
          {icons[type]}
          <Text as="span" tone="inherit">
            {message}
          </Text>
        </div>
        <Button
          onClick={() => toast.dismiss(t.id)}
          variant="ghost"
          size="icon-sm"
          className="rounded-md text-gray-500 hover:bg-transparent hover:text-gray-800"
        >
          <OutlineIcons.XMarkIcon className="h-4 w-4 cursor-pointer" />
        </Button>
      </div>
    ),
    {
      duration: 5000,
      position: "top-right",
      ...options,
    },
  )
}

export function useToast() {
  return {
    success: (msg: string, opts?: ToastOptions) => showCustomToast("success", msg, opts),
    error: (msg: string, opts?: ToastOptions) => showCustomToast("error", msg, opts),
    info: (msg: string, opts?: ToastOptions) => showCustomToast("info", msg, opts),
  }
}
