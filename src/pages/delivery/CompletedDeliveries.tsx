// src/pages/delivery/CompletedDeliveries.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  Calendar,
  MapPin,
  Package,
  Star
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const completedDeliveries = [
  {
    id: "DEL001",
    orderId: "ORD001",
    womanName: "Priya Sharma",
    address: "House 123, Block A, Sector 12",
    items: ["Sanitary Kit", "Nutrition Pack"],
    completedDate: "2024-02-20",
    rating: 5,
    feedback: "Very prompt service"
  },
  {
    id: "DEL002",
    orderId: "ORD002",
    womanName: "Sunita Patel",
    address: "House 45, Block C, Sector 15",
    items: ["Prenatal Vitamins"],
    completedDate: "2024-02-19",
    rating: 4,
    feedback: "Good service"
  },
  // Add more as needed
];

export default function CompletedDeliveries() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = completedDeliveries.filter(d =>
    d.womanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-green-600">Completed Deliveries</h1>
        <p className="text-muted-foreground mt-1">History of all delivered orders</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search completed deliveries..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Woman Name</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>{delivery.orderId}</TableCell>
                  <TableCell>{delivery.womanName}</TableCell>
                  <TableCell>{delivery.items.join(', ')}</TableCell>
                  <TableCell>{delivery.completedDate}</TableCell>
                  <TableCell>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < delivery.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                          }`}
                        />
            ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}