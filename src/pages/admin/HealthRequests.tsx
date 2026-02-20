// src/pages/admin/HealthRequests.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HealthRequest {
  id: string;
  womanName: string;
  requestType: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  description: string;
}

const mockRequests: HealthRequest[] = [
  {
    id: "REQ001",
    womanName: "Priya Sharma",
    requestType: "Emergency Medical Help",
    priority: "high",
    date: "2024-02-20",
    status: "pending",
    description: "Severe abdominal pain, needs immediate consultation"
  },
  {
    id: "REQ002",
    womanName: "Sunita Patel",
    requestType: "Prenatal Checkup",
    priority: "high",
    date: "2024-02-20",
    status: "approved",
    description: "Regular prenatal checkup - 7th month"
  },
  {
    id: "REQ003",
    womanName: "Lakshmi Devi",
    requestType: "Medicine Refill",
    priority: "medium",
    date: "2024-02-19",
    status: "completed",
    description: "Iron supplements refill needed"
  },
  {
    id: "REQ004",
    womanName: "Kavita Singh",
    requestType: "Mental Health Support",
    priority: "medium",
    date: "2024-02-19",
    status: "pending",
    description: "Requesting counseling session"
  },
  {
    id: "REQ005",
    womanName: "Meena Kumari",
    requestType: "Vaccination",
    priority: "low",
    date: "2024-02-18",
    status: "rejected",
    description: "Due for tetanus vaccine"
  },
  {
    id: "REQ006",
    womanName: "Radha Devi",
    requestType: "Emergency Help",
    priority: "high",
    date: "2024-02-20",
    status: "pending",
    description: "Bleeding during pregnancy"
  }
];

const priorityColors = {
  high: "destructive",
  medium: "warning",
  low: "secondary"
};

const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  completed: "secondary"
};

export default function HealthRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState(mockRequests);

  const filteredRequests = requests.filter(req =>
    req.womanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requestType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = (id: string, newStatus: HealthRequest['status']) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Health Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track health-related requests from women
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            Export List
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{requests.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-xl font-bold">{requests.filter(r => r.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{requests.filter(r => r.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-xl font-bold">{requests.filter(r => r.priority === 'high' && r.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or request type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Woman Name</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.womanName}</TableCell>
                  <TableCell>{request.requestType}</TableCell>
                  <TableCell>
                    <Badge variant={priorityColors[request.priority] as any}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[request.status] as any}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(request.id, 'approved')}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(request.id, 'completed')}>
                          <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(request.id, 'rejected')}>
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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