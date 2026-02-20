// src/components/layout/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";  // This imports AppSidebar, not Sidebar
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  requiredRole?: 'admin' | 'delivery';
}

export function DashboardLayout({ requiredRole }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />  {/* Use AppSidebar here, not Sidebar */}
          <main className="flex-1">
            {/* Mobile sidebar trigger */}
            <div className="lg:hidden p-4 border-b flex items-center">
              <SidebarTrigger />
            </div>
            {/* Page content */}
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}