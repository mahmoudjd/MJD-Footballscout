"use client";
import { ReactNode, useEffect, useMemo, useState } from "react";

const images = [
    "/backgrounds/0.jpg",
    "/backgrounds/1.jpg",
    "/backgrounds/3.jpg",
    "/backgrounds/4.jpg",
    "/backgrounds/5.jpg",
    "/backgrounds/6.jpg",
    "/backgrounds/7.jpg",
];

export function ImageBackground({ children }: { children: ReactNode }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const imageUrl = images[currentImageIndex];

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{ backgroundImage: `url(${imageUrl})` }}
        >
            {children}
        </div>
    );
}
