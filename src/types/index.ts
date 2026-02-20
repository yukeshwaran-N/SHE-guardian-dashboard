export type UserRole = "admin" | "delivery";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export type AlertSeverity = "red" | "yellow" | "green";

export interface HealthAlert {
  id: string;
  womanId: string;
  severity: AlertSeverity;
  location: string;
  issue: string;
  reportedAt: string;
  status: "active" | "assigned" | "resolved";
  assignedTo?: string;
}

export type RiskCategory = "high" | "medium" | "low";

export interface RegisteredWoman {
  id: string;
  name: string;
  age: number;
  riskCategory: RiskCategory;
  lastReportDate: string;
  status: "active" | "inactive";
  village: string;
}

export type DeliveryPriority = "urgent" | "normal";
export type DeliveryStatusType = "pending" | "accepted" | "in_transit" | "delivered";

export interface DeliveryRequest {
  id: string;
  requestId: string;
  location: string;
  kitType: string;
  priority: DeliveryPriority;
  contact: string;
  status: DeliveryStatusType;
  assignedTo?: string;
  requestedAt: string;
  deliveredAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  available: number;
  total: number;
  lowStock: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  icon: string;
}
