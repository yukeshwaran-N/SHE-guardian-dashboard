// src/pages/admin/WomanSelector.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { womanDashboardService } from "@/services/womanDashboardService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  User,
  Phone,
  MapPin,
  Loader2,
  Eye
} from "lucide-react";

interface Woman {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  village: string;
  district: string;
  risk_level: string;
}

export default function WomanSelector() {
  const navigate = useNavigate();
  const [women, setWomen] = useState<Woman[]>([]);
  const [filteredWomen, setFilteredWomen] = useState<Woman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchWomen();
  }, []);

  useEffect(() => {
    filterWomen();
  }, [women, searchTerm]);

  const fetchWomen = async () => {
    try {
      setLoading(true);
      const data = await womanDashboardService.getAllWomenList();
      setWomen(data);
      setFilteredWomen(data);
    } catch (error) {
      console.error("Error fetching women:", error);
      toast({
        title: "Error",
        description: "Failed to load women list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWomen = () => {
    if (!searchTerm) {
      setFilteredWomen(women);
      return;
    }

    const filtered = women.filter(w =>
      w.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone?.includes(searchTerm) ||
      w.village?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWomen(filtered);
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch(risk) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Woman Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Select a woman to view their complete dashboard
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search women by name, email, phone, or village..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Women Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWomen.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No women found</p>
            </CardContent>
          </Card>
        ) : (
          filteredWomen.map((woman) => (
            <Card key={woman.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(woman.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{woman.full_name}</h3>
                      <Badge variant={getRiskBadgeVariant(woman.risk_level)} className="mt-1">
                        {woman.risk_level?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {woman.email && (
                    <p className="text-sm text-muted-foreground truncate">{woman.email}</p>
                  )}
                  {woman.phone && (
                    <p className="text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {woman.phone}
                    </p>
                  )}
                  {(woman.village || woman.district) && (
                    <p className="text-sm flex items-center">
                      <MapPin className="h-3 w-3 mr-2" />
                      {woman.village || woman.district}
                    </p>
                  )}
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={() => navigate(`/admin/woman/${woman.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
