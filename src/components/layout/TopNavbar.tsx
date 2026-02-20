import { Bell, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TopNavbarProps {
  onMenuToggle: () => void;
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = user?.role === "admin" ? "Village Admin" : "Delivery Partner";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 shadow-sm">
      <button onClick={onMenuToggle} className="lg:hidden text-muted-foreground hover:text-foreground">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      {/* Role badge */}
      <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
        {roleLabel}
      </span>

      {/* Notifications */}
      <div className="relative">
        <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotif(!showNotif)}>
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        {showNotif && (
          <div className="absolute right-0 top-12 w-72 rounded-lg border bg-card p-4 shadow-lg">
            <h4 className="mb-2 text-sm font-semibold text-card-foreground">Notifications</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="rounded-md bg-destructive/10 p-2 text-destructive">🔴 New urgent alert: W-1042</p>
              <p className="rounded-md bg-warning/10 p-2 text-warning-foreground">🟡 Delivery REQ-2041 pending</p>
              <p className="rounded-md bg-muted p-2">System update completed</p>
            </div>
          </div>
        )}
      </div>

      {/* User info */}
      <div className="hidden items-center gap-2 sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {user?.name?.charAt(0)}
        </div>
        <span className="text-sm font-medium text-foreground">{user?.name}</span>
      </div>

      <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
