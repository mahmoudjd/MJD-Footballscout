import {JSX} from "react";

interface InfoItemProps {
    icon: JSX.Element;
    label: string;
    value: string | number;
    clickable?: boolean;
    onClick?: () => void;
}

const ProfileInfoItem = ({icon, label, value, clickable, onClick}: InfoItemProps) => (
    <div
        onClick={clickable ? onClick : undefined}
        className={`flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm ${
            clickable ? "cursor-pointer hover:bg-cyan-50 transition" : ""
        }`}
    >
        <div className="w-6 h-6 mt-1 text-cyan-600">{icon}</div>
        <div className="flex flex-col text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900 break-words">{value}</span>
        </div>
    </div>
);

export default ProfileInfoItem;