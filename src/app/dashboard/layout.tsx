import { Navbar } from "@/components/navbar";
import { DashboardSidebar } from "./sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="flex h-[calc(100dvh-4rem)]">
                <DashboardSidebar />

                {/* Main content area — scrolls independently */}
                <main className="flex-1 min-w-0 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
