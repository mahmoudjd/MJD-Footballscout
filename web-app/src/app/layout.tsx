import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";

import Header from "@/components/header/header";
import {Footer} from "@/components/footer";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MJD-FootballScout",
    description: "This app extract the football players data from internet and show it",
};

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <link rel="icon" href="/favicon.ico" sizes="any"/>
            <title>MJD-FootballScout</title>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Header/>
        <main className="min-h-[calc(100vh-8.5rem)]">
        {children}
        </main>
        <Footer />
        </body>
        </html>
    );
}
