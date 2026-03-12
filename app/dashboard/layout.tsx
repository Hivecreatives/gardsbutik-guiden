import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="bg-cream dark:bg-[#171b18] text-slate-900 dark:text-slate-100 font-body min-h-screen border-none overflow-x-hidden">
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
