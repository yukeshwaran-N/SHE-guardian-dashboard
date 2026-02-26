// src/pages/admin/Reports.tsx
import { useState } from "react";
import { reportsService, ReportData, ReportFilters } from "@/services/reportsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Download,
  FileText,
  Calendar,
  Loader2,
  TrendingUp,
  Users,
  Package,
  Video,
  IndianRupee,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'all'
  });
  const { toast } = useToast();

  const generateReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.generateReport(filters);
      setReportData(data);
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportSection = (data: any[], filename: string) => {
    reportsService.exportToCSV(data, filename);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Generate insights and export data for analysis
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value: any) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="women">Women Report</SelectItem>
                  <SelectItem value="deliveries">Deliveries Report</SelectItem>
                  <SelectItem value="consultations">Consultations Report</SelectItem>
                  <SelectItem value="payments">Payments Report</SelectItem>
                  <SelectItem value="alerts">Alerts Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Women</p>
                    <p className="text-2xl font-bold">{reportData.summary.totalWomen}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">
                  +{reportData.summary.newWomen} new
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Deliveries</p>
                    <p className="text-2xl font-bold">{reportData.summary.totalDeliveries}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {reportData.summary.completedDeliveries} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Consultations</p>
                    <p className="text-2xl font-bold">{reportData.summary.totalConsultations}</p>
                  </div>
                  <Video className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {reportData.summary.completedConsultations} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(reportData.summary.totalRevenue)}</p>
                  </div>
                  <IndianRupee className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {reportData.summary.totalPayments} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold">{reportData.summary.totalAlerts}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {reportData.summary.resolvedAlerts} resolved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="women">Women</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Women Growth Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Women Growth</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => exportSection(reportData.charts.womenGrowth, 'women-growth')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReLineChart data={reportData.charts.womenGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#8884d8" />
                        </ReLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Deliveries by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Deliveries by Status</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => exportSection(reportData.charts.deliveriesByStatus, 'deliveries-status')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={reportData.charts.deliveriesByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            dataKey="count"
                          >
                            {reportData.charts.deliveriesByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="women">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Recent Women Registrations</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportSection(reportData.tables.recentWomen, 'recent-women')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Phone</th>
                          <th className="text-left py-2">Village</th>
                          <th className="text-left py-2">Risk Level</th>
                          <th className="text-left py-2">Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tables.recentWomen.map((woman: any) => (
                          <tr key={woman.id} className="border-b">
                            <td className="py-2">{woman.users?.full_name}</td>
                            <td className="py-2">{woman.users?.email}</td>
                            <td className="py-2">{woman.users?.phone}</td>
                            <td className="py-2">{woman.village}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                woman.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                woman.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {woman.risk_level}
                              </span>
                            </td>
                            <td className="py-2">{new Date(woman.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliveries">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Recent Deliveries</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportSection(reportData.tables.recentDeliveries, 'recent-deliveries')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Order #</th>
                          <th className="text-left py-2">Woman</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Amount</th>
                          <th className="text-left py-2">Scheduled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tables.recentDeliveries.map((delivery: any) => (
                          <tr key={delivery.id} className="border-b">
                            <td className="py-2 font-mono">{delivery.order_number}</td>
                            <td className="py-2">{delivery.women?.users?.full_name}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                delivery.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {delivery.status}
                              </span>
                            </td>
                            <td className="py-2">₹{delivery.total_amount}</td>
                            <td className="py-2">{new Date(delivery.scheduled_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Recent Payments</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportSection(reportData.tables.recentPayments, 'recent-payments')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Payment ID</th>
                          <th className="text-left py-2">User</th>
                          <th className="text-left py-2">Amount</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tables.recentPayments.map((payment: any) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-2 font-mono">{payment.payment_id}</td>
                            <td className="py-2">{payment.users?.full_name}</td>
                            <td className="py-2">₹{payment.amount}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                payment.status === 'success' ? 'bg-green-100 text-green-800' :
                                payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-2">{new Date(payment.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}