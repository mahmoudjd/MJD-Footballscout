import {SolidIcons} from "@/components/solid-icons";
import {TitleType} from "@/lib/types/type";

interface Props {
    titles: Array<TitleType>;
}

export default function Titles({titles}: Props) {
    return (
        <section className="mt-6 bg-gray-50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 pb-2">
                Titles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {titles.map((title, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                        <SolidIcons.TrophyIcon className="w-8 h-8 text-yellow-400"/>
                        <div className="flex flex-1 justify-between items-center">
                            <span className="font-semibold text-gray-800 text-lg">{title.name}</span>
                            <span className="bg-indigo-100 text-indigo-700 font-bold rounded-full px-3 py-1 text-sm">
                                {title.number}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
