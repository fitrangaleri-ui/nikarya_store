import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { FilterDrawerProvider } from "@/context/filter-drawer-context";
import { DemoPreviewProvider } from "@/components/demo-preview-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterDrawerProvider>
      <DemoPreviewProvider>
        <div className="min-h-screen">
          <Navbar />
          {children}
          <BottomNav />
          <SiteFooter />
        </div>
      </DemoPreviewProvider>
    </FilterDrawerProvider>
  );
}
