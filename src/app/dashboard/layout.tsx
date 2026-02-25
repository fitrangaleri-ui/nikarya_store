"use client";

import { Navbar } from "@/components/navbar";
import { DashboardFab } from "./dashboard-fab";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Main content — full width, no sidebar */}
            <main className="min-h-[calc(100dvh-84px)] md:min-h-[calc(100dvh-6rem)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
                    {children}
                </div>
            </main>

            {/* Floating Action Button navigation */}
            <DashboardFab />
        </div>
    );
}
