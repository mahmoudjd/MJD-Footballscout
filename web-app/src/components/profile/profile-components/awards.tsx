import {Award} from "@/lib/types/type";
import {SolidIcons} from "@/components/solid-icons";

interface AwardProps {
    awards: Array<Award>;
}

export default function Awards({awards}: AwardProps) {
    return (
        <section className="mt-6 bg-gray-50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                Awards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {awards.map((award, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                        <SolidIcons.StarIcon className="w-8 h-8 text-yellow-400"/>
                        <div className="flex flex-1 justify-between items-center">
                            <span className="font-semibold text-gray-800 text-lg">{award.name}</span>
                            <span
                                className="bg-indigo-100 text-indigo-600 font-bold rounded-full px-3 py-1 text-sm">{award.number}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
