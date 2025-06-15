import { OutlineIcons } from "@/components/outline-icons";
import { Transfer } from "@/lib/types/type";
import {JSX} from "react";

interface Props {
    transfers: Array<Transfer>;
}

function parseAmount(amount: string): { display: string; fullValue?: string; icon: JSX.Element } {
    const cleaned = amount?.trim();

    if (!cleaned) {
        return {
            display: "Undisclosed",
            icon: <OutlineIcons.QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" />,
        };
    }

    if (/^\d{4}$/.test(cleaned)) {
        return {
            display: `Until ${cleaned}`,
            icon: <OutlineIcons.ClockIcon className="w-5 h-5 text-amber-500" />,
        };
    }

    if (cleaned === "Free Transfer") {
        return {
            display: "Free Transfer",
            icon: <OutlineIcons.ArrowsRightLeftIcon className="w-5 h-5 text-indigo-500" />,
        };
    }

    // Format amounts like 180M or 15K
    const match = cleaned.match(/^(\d+(?:\.\d+)?)([MK])$/i);
    if (match) {
        const num = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        const fullValue =
            unit === "M" ? `€${(num * 1_000_000).toLocaleString()}` : `€${(num * 1_000).toLocaleString()}`;
        return {
            display: `€${cleaned.toUpperCase()}`,
            fullValue,
            icon: <OutlineIcons.CurrencyEuroIcon className="w-5 h-5 text-green-600" />,
        };
    }

    // fallback: just return raw value with €
    return {
        display: `€${cleaned}`,
        icon: <OutlineIcons.CurrencyEuroIcon className="w-5 h-5 text-green-600" />,
    };
}

export default function Transfers({ transfers }: Props) {
    return (
        <section className="bg-gray-50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 pb-2">
                Transfers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {transfers.map((t, idx) => {
                    const { display, fullValue, icon } = parseAmount(t.amount);

                    return (
                        <div
                            key={idx}
                            className="flex flex-col gap-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                        >
                            {/* Season */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <OutlineIcons.CalendarIcon className="w-5 h-5 text-cyan-600" />
                                <span className="font-medium">{t.season}</span>
                            </div>

                            {/* Team */}
                            <div className="flex items-center gap-2">
                                <OutlineIcons.ArrowsRightLeftIcon className="w-6 h-6 text-indigo-600" />
                                <span className="text-indigo-700 font-semibold text-base">{t.team}</span>
                            </div>

                            {/* Amount */}
                            <div className="flex items-center gap-2 mt-auto text-sm text-gray-600">
                                {icon}
                                <span
                                    className="font-bold text-gray-800"
                                    title={fullValue ?? ""}
                                >
                                    {display}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
