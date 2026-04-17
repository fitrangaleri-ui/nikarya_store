import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { FilterDrawerProvider } from "@/context/filter-drawer-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterDrawerProvider>
      <div className="min-h-screen">
        <Navbar />
        {children}
        <BottomNav />
        <SiteFooter />
      </div>
    </FilterDrawerProvider>
  );
}
