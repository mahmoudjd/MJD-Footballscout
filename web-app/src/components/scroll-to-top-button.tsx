"use client";

import React, {useState, useEffect} from "react";
import {OutlineIcons} from "@/components/outline-icons";

export function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setVisible(window.scrollY > 100);
        }

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    function scrollToTop() {
        window.scrollTo({top: 0, behavior: "smooth"});
    }

    if (!visible) return null;

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="
        fixed
        bottom-6
        right-6
        p-3
        rounded-full
        bg-cyan-600
        text-white
        shadow-lg
        hover:bg-cyan-700
        transition
        z-50
        cursor-pointer
      "
        >
            <OutlineIcons.ArrowUpIcon className="w-6 h-6"/>

        </button>
    );
}
