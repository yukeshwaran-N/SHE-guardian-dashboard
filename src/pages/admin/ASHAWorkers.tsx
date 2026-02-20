// src/pages/admin/ASHAWorkers.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Award,
  MoreHorizontal
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ASHAWorker {
  id: string;
  name: string;
  avatar?: string;
  area: string;
  phone: string;
  email: string;
  womenAssigned: number;
  performance: number;
  status: 'active' | 'inactive' | 'on-leave';
  joinDate: string;
}

const mockWorkers: ASHAWorker[] = [
  {
    id: "ASH001",
    name: "Asha Kumari",
    area: "Sector 12, Block A",
    phone: "+91 98765 43210",
    email: "asha.kumari@sakhi.gov.in",
    womenAssigned: 45,
    performance: 98,
    status: 'active',
    joinDate: "2023-01-15"
  },
  {
    id: "ASH002",
    name: "Meena Devi",
    area: "Sector 15, Block C",
    phone: "+91 98765 43211",
    email: "meena.devi@sakhi.gov.in",
    womenAssigned: 38,
    performance: 95,
    status: 'active',
    joinDate: "2023-03-20"
  },
  {
    id: "ASH003",
    name: "Sunita Yadav",
    area: "Sector 14, Block D",
    phone: "+91 98765 43212",
    email: "sunita.yadav@sakhi.gov.in",
    womenAssigned: 42,
    performance: 92,
    status: 'active',
    joinDate: "2023-02-10"
  },
  {
    id: "ASH004",
    name: "Priya ASHA",
    area: "Sector 16, Block E",
    phone: "+91 98765 43213",
    email: "priya.asha@sakhi.gov.in",
    womenAssigned: 35,
    performance: 88,
    status: 'on-leave',
    joinDate: "2023-04-05"
  },
  {
    id: "ASH005",
    name: "Rani ASHA",
    area: "Sector 18, Block F",
    phone: "+91 98765 43214",
    email: "rani.asha@sakhi.gov.in",
    womenAssigned: 40,
    performance: 96,
    status: 'active',
    joinDate: "2023-01-22"
  }
];

export default function ASHAWorkers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [workers] = useState(mockWorkers);

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'on-leave': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ASHA Workers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor ASHA workers performance
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Worker
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workers.length}</div>
            <p className="text-sm text-muted-foreground">Total Workers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {workers.filter(w => w.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workers.reduce((acc, w) => acc + w.womenAssigned, 0)}</div>
            <p className="text-sm text-muted-foreground">Women Covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(workers.reduce((acc, w) => acc + w.performance, 0) / workers.length)}%
            </div>
            <p className="text-sm text-muted-foreground">Avg Performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or area..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkers.map((worker) => (
          <Card key={worker.id} className="hover-card overflow-hidden">
            <div className={`h-2 ${getStatusColor(worker.status)}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${worker.name}`} />
                    <AvatarFallback>{worker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{worker.name}</h3>
                    <p className="text-sm text-muted-foreground">{worker.id}</p>
                  </div>
                </div>
                <Badge variant={worker.status === 'active' ? 'success' : worker.status === 'on-leave' ? 'warning' : 'secondary'}>
                  {worker.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{worker.area}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{worker.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{worker.email}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Women Assigned</span>
                  <span className="font-medium">{worker.womenAssigned}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium">{worker.performance}%</span>
                </div>
                <Progress value={worker.performance} className="h-2" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Joined {worker.joinDate}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}