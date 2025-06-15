import { Attribute } from "@/lib/types/type";
import {
    BoltIcon,
    FireIcon,
    ShieldCheckIcon,
    EyeDropperIcon,
    RocketLaunchIcon,
    ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import {JSX} from "react";

interface Props {
    attributes: Attribute[];
}

const iconMap: Record<string, JSX.Element> = {
    pace: <BoltIcon className="w-6 h-6 text-blue-600" />,
    shot: <RocketLaunchIcon className="w-6 h-6 text-red-600" />,
    pass: <ArrowsPointingOutIcon className="w-6 h-6 text-yellow-500" />,
    dribbling: <EyeDropperIcon className="w-6 h-6 text-violet-500" />,
    defence: <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />,
    physical: <FireIcon className="w-6 h-6 text-orange-500" />,
};

const getColor = (value: string) => {
    const numOfValue = parseInt(value, 10);
    if (numOfValue >= 80) return "bg-green-500";
    if (numOfValue >= 60) return "bg-yellow-400";
    return "bg-red-500";
};

export default function Attributes({ attributes }: Props) {
    return (
        <section className="bg-gray-50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Player Attributes</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {attributes.map((attr, index) => {
                    const name = attr.name.toLowerCase();
                    const icon = iconMap[name] ?? <FireIcon className="w-6 h-6 text-gray-400" />;

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center p-4 bg-white shadow-md rounded-full w-28 h-28 mx-auto border border-gray-200"
                        >
                            <div className="mb-1">{icon}</div>
                            <span className="text-sm font-semibold text-gray-700 capitalize">{attr.name}</span>
                            <span className={`text-xl font-bold mt-1 ${getColor(attr.value)} text-white rounded-full px-3 py-1`}>
                {attr.value}
              </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
