// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AppUsers from './pages/admin/AppUsers';
import DebugUsers from "./pages/DebugUsers";



// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import HelpSupport from "./pages/HelpSupport";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ActiveAlerts from "./pages/admin/ActiveAlerts";
import WomenRegistry from "./pages/admin/WomenRegistry";
import DeliveryStatus from "./pages/admin/DeliveryStatus";
import HealthRequests from "./pages/admin/HealthRequests";
import ASHAWorkers from "./pages/admin/ASHAWorkers";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";



// Delivery Pages
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import AssignedDeliveries from "./pages/delivery/AssignedDeliveries";
import Inventory from "./pages/delivery/Inventory";
import CompletedDeliveries from "./pages/delivery/CompletedDeliveries";
import Profile from "./pages/delivery/Profile";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />

              {/* 🔥 IMPORTANT: All protected routes should be INSIDE DashboardLayout */}
              <Route element={<DashboardLayout />}>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/alerts" element={<ActiveAlerts />} />
                <Route path="/admin/registry" element={<WomenRegistry />} />
                <Route path="/admin/deliveries" element={<DeliveryStatus />} />
                <Route path="/admin/requests" element={<HealthRequests />} />
                <Route path="/admin/asha" element={<ASHAWorkers />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/admin/app-users" element={<AppUsers />} />
                <Route path="/debug-users" element={<DebugUsers />} />

                {/* Delivery Routes */}
                <Route path="/delivery" element={<DeliveryDashboard />} />
                <Route path="/delivery/assigned" element={<AssignedDeliveries />} />
                <Route path="/delivery/inventory" element={<Inventory />} />
                <Route path="/delivery/completed" element={<CompletedDeliveries />} />
                <Route path="/delivery/profile" element={<Profile />} />

                {/* 🔥 Common Pages - Now they will show with sidebar */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/help" element={<HelpSupport />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;