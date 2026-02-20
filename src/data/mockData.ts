// src/data/mockData.ts - Temporary mock data until Supabase is ready

export interface Alert {
  id: string;
  womanName: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  location: string;
  status: 'active' | 'resolved';
}

export interface Woman {
  id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  ashaWorker: string;
  lastVisit: string;
  status: 'active' | 'inactive' | 'high-risk';
}

export interface Delivery {
  id: string;
  orderId: string;
  womanName: string;
  address: string;
  items: string[];
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
  scheduledDate: string;
  deliveryPartner?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
  lastRestocked: string;
}

// Mock Alerts Data
export const mockAlerts: Alert[] = [
  {
    id: "1",
    womanName: "Priya Sharma",
    type: "Health Emergency",
    severity: "high",
    timestamp: "2024-02-20T10:30:00",
    location: "Block A, Sector 12",
    status: "active"
  },
  {
    id: "2",
    womanName: "Sunita Patel",
    type: "Missed Checkup",
    severity: "medium",
    timestamp: "2024-02-20T09:15:00",
    location: "Block C, Sector 15",
    status: "active"
  },
  {
    id: "3",
    womanName: "Lakshmi Devi",
    type: "Delivery Assistance",
    severity: "high",
    timestamp: "2024-02-20T08:45:00",
    location: "Block B, Sector 10",
    status: "active"
  }
];

// Mock Women Registry Data
export const mockWomen: Woman[] = [
  {
    id: "W001",
    name: "Priya Sharma",
    age: 28,
    phone: "+91 98765 43210",
    address: "House 123, Block A, Sector 12",
    ashaWorker: "Asha Kumari",
    lastVisit: "2024-02-15",
    status: "active"
  },
  {
    id: "W002",
    name: "Sunita Patel",
    age: 32,
    phone: "+91 98765 43211",
    address: "House 45, Block C, Sector 15",
    ashaWorker: "Meena Devi",
    lastVisit: "2024-02-10",
    status: "high-risk"
  },
  {
    id: "W003",
    name: "Lakshmi Devi",
    age: 24,
    phone: "+91 98765 43212",
    address: "House 67, Block B, Sector 10",
    ashaWorker: "Asha Kumari",
    lastVisit: "2024-02-18",
    status: "active"
  },
  {
    id: "W004",
    name: "Kavita Singh",
    age: 35,
    phone: "+91 98765 43213",
    address: "House 89, Block D, Sector 14",
    ashaWorker: "Sunita Yadav",
    lastVisit: "2024-02-01",
    status: "inactive"
  }
];

// Mock Deliveries Data
export const mockDeliveries: Delivery[] = [
  {
    id: "D001",
    orderId: "ORD001",
    womanName: "Priya Sharma",
    address: "House 123, Block A, Sector 12",
    items: ["Sanitary Kit", "Nutrition Pack"],
    status: "assigned",
    scheduledDate: "2024-02-21",
    deliveryPartner: "delivery01"
  },
  {
    id: "D002",
    orderId: "ORD002",
    womanName: "Sunita Patel",
    address: "House 45, Block C, Sector 15",
    items: ["Prenatal Vitamins", "Health Supplements"],
    status: "in-transit",
    scheduledDate: "2024-02-20",
    deliveryPartner: "delivery02"
  },
  {
    id: "D003",
    orderId: "ORD003",
    womanName: "Lakshmi Devi",
    address: "House 67, Block B, Sector 10",
    items: ["Postnatal Care Kit"],
    status: "pending",
    scheduledDate: "2024-02-22"
  }
];

// Mock Inventory Data
export const mockInventory: InventoryItem[] = [
  {
    id: "INV001",
    name: "Sanitary Napkins",
    category: "Hygiene",
    quantity: 500,
    unit: "packs",
    threshold: 100,
    lastRestocked: "2024-02-15"
  },
  {
    id: "INV002",
    name: "Prenatal Vitamins",
    category: "Medicine",
    quantity: 50,
    unit: "bottles",
    threshold: 20,
    lastRestocked: "2024-02-10"
  },
  {
    id: "INV003",
    name: "Health Supplements",
    category: "Nutrition",
    quantity: 30,
    unit: "boxes",
    threshold: 15,
    lastRestocked: "2024-02-12"
  },
  {
    id: "INV004",
    name: "Delivery Kits",
    category: "Medical",
    quantity: 25,
    unit: "kits",
    threshold: 10,
    lastRestocked: "2024-02-18"
  }
];