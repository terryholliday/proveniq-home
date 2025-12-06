import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { Input } from "../ui/input";
import { PermissionsInitializer } from "@/components/permissions-initializer";
import { MyArkLogo } from "../onboarding/MyArkLogo";
import { ErrorBoundary } from "@/components/error-boundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <MyArkLogo size={32} priority />
            <span className="text-lg font-semibold text-sidebar-primary">MyARK</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* UserNav is moved from here */}
          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <a href="/admin" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ShieldCheck className="h-3 w-3" />
              <span>Admin</span>
            </a>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="inventory-search"
              type="search"
              placeholder="Ask your ARK..."
              className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6">
          <PermissionsInitializer />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
