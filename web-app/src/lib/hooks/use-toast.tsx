import toast, { ToastOptions } from "react-hot-toast";
import {OutlineIcons} from "@/components/outline-icons";
import {SolidIcons} from "@/components/solid-icons";

const baseStyles = "rounded-md px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-sm";
const variants = {
    info: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
};

const icons = {
    info: <OutlineIcons.InformationCircleIcon className="w-5 h-5 text-yellow-600" />,
    success: <SolidIcons.CheckCircleIcon className="w-5 h-5 text-green-600" />,
    error: <SolidIcons.ExclamationTriangleIcon className="w-5 h-5 text-red-600" />,
};

function showCustomToast(
    type: "info" | "success" | "error",
    message: string,
    options?: ToastOptions
) {
    toast.custom((t) => (
        <div
            className={`${baseStyles} ${variants[type]} ${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full`}
        >
            <div className="flex items-center gap-2">
                {icons[type]}
                <span>{message}</span>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-gray-500 hover:text-gray-800">
                <OutlineIcons.XMarkIcon className="w-4 h-4 cursor-pointer" />
            </button>
        </div>
    ), {
        duration: 5000,
        position: "top-right",
        ...options,
    });
}

export function useToast() {
    return {
        success: (msg: string, opts?: ToastOptions) => showCustomToast("success", msg, opts),
        error: (msg: string, opts?: ToastOptions) => showCustomToast("error", msg, opts),
        info: (msg: string, opts?: ToastOptions) => showCustomToast("info", msg, opts),
    };
}
