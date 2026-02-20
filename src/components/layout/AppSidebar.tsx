// src/components/layout/AppSidebar.tsx
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  Home, 
  AlertCircle, 
  Users, 
  Truck, 
  Package, 
  ClipboardList,
  LogOut,
  User,
  Settings,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  // Common menu items for both roles
  const commonMenuItems = [
    { icon: Home, label: "Dashboard", path: user.role === "admin" ? "/admin" : "/delivery" },
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    { icon: AlertCircle, label: "Active Alerts", path: "/admin/alerts", badge: 3 },
    { icon: Users, label: "Women Registry", path: "/admin/registry" },
    { icon: Truck, label: "Delivery Status", path: "/admin/deliveries", badge: 5 },
    { icon: FileText, label: "Health Requests", path: "/admin/requests", badge: 2 },
    { icon: Users, label: "ASHA Workers", path: "/admin/asha" },
    { icon: BarChart3, label: "Reports", path: "/admin/reports" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
    { icon: Users, label: "App Users", path: "/admin/app-users" },
  ];

  // Delivery-specific menu items
  const deliveryMenuItems = [
    { icon: ClipboardList, label: "Assigned Deliveries", path: "/delivery/assigned", badge: 4 },
    { icon: Package, label: "Inventory", path: "/delivery/inventory" },
    { icon: Truck, label: "Completed", path: "/delivery/completed" },
    { icon: User, label: "Profile", path: "/delivery/profile" },
  ];

  // Choose menu based on role
  const menuItems = [
    ...commonMenuItems,
    ...(user?.role === "admin" ? adminMenuItems : deliveryMenuItems)
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={`border-r bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <SidebarHeader className="p-4 border-b relative">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold">S</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold leading-none bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                SAKHI
              </h2>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {user?.role} Portal
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background flex items-center justify-center hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="px-3 py-2">
          {!collapsed && (
            <div className="mb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Menu
            </div>
          )}
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted/80 hover:text-primary'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive(item.path) ? 'text-white' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant={isActive(item.path) ? "secondary" : "outline"} className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Bottom section with notifications and help */}
        <div className="px-3 py-2 mt-auto">
          {!collapsed && (
            <div className="mb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Support
            </div>
          )}
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link 
                  to="/notifications"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/80 transition-all ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">Notifications</span>
                      <Badge variant="destructive" className="ml-auto">3</Badge>
                    </>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link 
                  to="/help"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/80 transition-all ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  {!collapsed && <span>Help & Support</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}