// src/components/layout/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  requiredRole?: 'admin' | 'delivery';
}

export function DashboardLayout({ requiredRole }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
              <div className="flex h-16 items-center px-4 gap-4">
                {/* Mobile sidebar trigger */}
                <SidebarTrigger className="lg:hidden" />
                
                {/* Spacer */}
                <div className="flex-1" />
                
                {/* Right side icons */}
                <div className="flex items-center gap-2">
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full hover:bg-muted/50 p-1 transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                            {user?.id?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium hidden md:inline-block">
                          {user?.id}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/help')}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1">
              <div className="p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}