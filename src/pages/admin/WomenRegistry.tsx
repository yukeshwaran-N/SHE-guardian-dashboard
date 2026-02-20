// src/pages/admin/WomenRegistry.tsx
import { useState, useEffect } from "react";
import { womenService } from "@/services/womenService";
import { Woman } from "@/services/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WomenRegistry() {
  const [women, setWomen] = useState<Woman[]>([]);
  const [filteredWomen, setFilteredWomen] = useState<Woman[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWomen();
  }, []);

  useEffect(() => {
    // Filter women based on search term
    if (searchTerm.trim() === "") {
      setFilteredWomen(women);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = women.filter(
        (w) =>
          w.id.toLowerCase().includes(term) ||
          w.name.toLowerCase().includes(term) ||
          (w.phone && w.phone.toLowerCase().includes(term)) ||
          (w.address && w.address.toLowerCase().includes(term))
      );
      setFilteredWomen(filtered);
    }
  }, [searchTerm, women]);

  const fetchWomen = async () => {
    try {
      setLoading(true);
      const data = await womenService.getAllWomen();
      setWomen(data);
      setFilteredWomen(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching women:", err);
      setError("Failed to load women registry");
      toast({
        title: "Error",
        description: "Could not fetch women data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get risk level based on status
  const getRiskLevel = (status: string) => {
    switch(status) {
      case 'high-risk': return 'High';
      case 'active': return 'Low';
      case 'inactive': return 'None';
      default: return 'Unknown';
    }
  };

  // Function to get village from address
  const getVillageFromAddress = (address: string) => {
    if (!address) return 'N/A';
    const parts = address.split(',');
    // Try to extract village/sector info
    const sectorMatch = address.match(/Sector\s+(\d+)/i);
    if (sectorMatch) return `Sector ${sectorMatch[1]}`;
    
    const blockMatch = address.match(/Block\s+([A-Z])/i);
    if (blockMatch) return `Block ${blockMatch[1]}`;
    
    return parts[parts.length - 1]?.trim() || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={fetchWomen}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Women Registry</h1>
          <p className="text-muted-foreground mt-1">
            Registered beneficiaries database
          </p>
        </div>
        <Button onClick={fetchWomen} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, phone, or address..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Women Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address/Village</TableHead>
                <TableHead>ASHA Worker</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWomen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No women found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWomen.map((woman) => (
                  <TableRow key={woman.id}>
                    <TableCell className="font-medium">{woman.id}</TableCell>
                    <TableCell>{woman.name}</TableCell>
                    <TableCell>{woman.age}</TableCell>
                    <TableCell>{woman.phone || 'N/A'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {getVillageFromAddress(woman.address || '')}
                    </TableCell>
                    <TableCell>{woman.asha_worker || 'Not assigned'}</TableCell>
                    <TableCell>{woman.last_visit || 'N/A'}</TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={getRiskLevel(woman.status).toLowerCase() as any} 
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={woman.status as any} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Women</p>
            <p className="text-2xl font-bold">{women.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">High Risk</p>
            <p className="text-2xl font-bold text-destructive">
              {women.filter(w => w.status === 'high-risk').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {women.filter(w => w.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-500">
              {women.filter(w => w.status === 'inactive').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}