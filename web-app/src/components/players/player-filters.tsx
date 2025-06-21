import React from "react";
import {SolidIcons} from "@/components/solid-icons";

interface Props {
    selectedPosition: string;
    selectedAgeGroup: string;
    selectedNationality: string;
    nationalities: string[];
    onPositionChange: (val: string) => void;
    onAgeGroupChange: (val: string) => void;
    onNationalityChange: (val: string) => void;
}

const PlayerFilters = ({
                           selectedPosition,
                           selectedAgeGroup,
                           selectedNationality,
                           nationalities,
                           onPositionChange,
                           onAgeGroupChange,
                           onNationalityChange,
                       }: Props) => {
    return (
        <div className="w-full bg-white border border-gray-100 shadow-sm rounded-md p-6 space-y-4">
            <div className="flex items-center space-x-2 text-gray-700 font-semibold text-lg">
                <SolidIcons.AdjustmentsVerticalIcon className="w-5 h-5 text-cyan-600"/>
                <span>Filter Players</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Position Filter */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Position</label>
                    <select
                        className="w-full cursor-pointer border border-gray-200 bg-white rounded px-4 py-2 text-sm text-gray-800 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        value={selectedPosition}
                        onChange={(e) => onPositionChange(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Forward">Forward</option>
                        <option value="Midfielder">Midfielder</option>
                        <option value="Defender">Defender</option>
                        <option value="Goalkeeper">Goalkeeper</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>

                {/* Age Group Filter */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Age Group</label>
                    <select
                        className="w-full cursor-pointer border border-gray-200 bg-white rounded px-4 py-2 text-sm text-gray-800 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        value={selectedAgeGroup}
                        onChange={(e) => onAgeGroupChange(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="<20">&lt; 20</option>
                        <option value="20-30">20 - 30</option>
                        <option value="30-40">30 - 40</option>
                        <option value=">40">&gt; 40</option>
                    </select>
                </div>

                {/* Nationality Filter */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Nationality</label>
                    <select
                        className="w-full cursor-pointer border border-gray-200 bg-white rounded px-4 py-2 text-sm text-gray-800 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        value={selectedNationality}
                        onChange={(e) => onNationalityChange(e.target.value)}
                    >
                        <option value="">All</option>
                        {nationalities.map((nation, idx) => (
                            <option key={idx} value={nation}>
                                {nation}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PlayerFilters;
