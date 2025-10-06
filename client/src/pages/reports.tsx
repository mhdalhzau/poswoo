import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { woocommerce } from "@/lib/woocommerce";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Download,
  Calendar,
  BarChart3
} from "lucide-react";

// Mock data for charts (in production, this would come from WooCommerce analytics)
const salesData = [
  { name: 'Mon', sales: 2400, orders: 24 },
  { name: 'Tue', sales: 1398, orders: 18 },
  { name: 'Wed', sales: 9800, orders: 42 },
  { name: 'Thu', sales: 3908, orders: 28 },
  { name: 'Fri', sales: 4800, orders: 35 },
  { name: 'Sat', sales: 3800, orders: 32 },
  { name: 'Sun', sales: 4300, orders: 38 },
];

const topProductsData = [
  { name: 'Electronics', value: 400, color: 'hsl(var(--primary))' },
  { name: 'Accessories', value: 300, color: 'hsl(var(--accent))' },
  { name: 'Clothing', value: 200, color: 'hsl(var(--secondary))' },
  { name: 'Home', value: 100, color: 'hsl(var(--muted))' },
];

const monthlyTrendsData = [
  { month: 'Jan', revenue: 4000, orders: 240 },
  { month: 'Feb', revenue: 3000, orders: 180 },
  { month: 'Mar', revenue: 5000, orders: 300 },
  { month: 'Apr', revenue: 4500, orders: 270 },
  { month: 'May', revenue: 6000, orders: 360 },
  { month: 'Jun', revenue: 5500, orders: 330 },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => woocommerce.getDashboardStats(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => woocommerce.getOrders(100),
  });

  const exportReport = (type: string) => {
    // In production, this would generate and download actual reports
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="p-6 space-y-6" data-testid="reports-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Sales analytics and performance insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => exportReport('sales')}
            className="flex items-center space-x-2"
            data-testid="export-sales-button"
          >
            <Download size={16} />
            <span>Export Sales</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReport('inventory')}
            className="flex items-center space-x-2"
            data-testid="export-inventory-button"
          >
            <Download size={16} />
            <span>Export Inventory</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-primary" size={24} />
              </div>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <TrendingUp size={12} />
                <span>+12.5%</span>
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              ${statsLoading ? "..." : stats?.todaysSales || "0.00"}
            </h3>
            <p className="text-sm text-muted-foreground">Today's Revenue</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-accent" size={24} />
              </div>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <TrendingUp size={12} />
                <span>+8.2%</span>
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {statsLoading ? "..." : stats?.todaysOrders || 0}
            </h3>
            <p className="text-sm text-muted-foreground">Orders Today</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="text-secondary" size={24} />
              </div>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <TrendingUp size={12} />
                <span>+15.3%</span>
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {statsLoading ? "..." : stats?.totalCustomers || 0}
            </h3>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Package className="text-orange-500" size={24} />
              </div>
              <Badge variant="destructive" className="flex items-center space-x-1">
                <TrendingDown size={12} />
                <span>Low Stock</span>
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {statsLoading ? "..." : stats?.totalProducts || 0}
            </h3>
            <p className="text-sm text-muted-foreground">Products in Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales" data-testid="tab-sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory Report</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 size={20} />
                    <span>Daily Sales</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {["week", "month", "year"].map((period) => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                        className="capitalize"
                        data-testid={`period-${period}`}
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topProductsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {topProductsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ordersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-12 h-12 rounded" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))
                  ) : (
                    topProductsData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package size={20} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.value} sold</p>
                          </div>
                        </div>
                        <Badge variant="secondary">${(item.value * 15).toFixed(0)}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users size={48} className="mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Customer Analytics</p>
                <p className="text-sm">Detailed customer insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="text-accent" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {statsLoading ? "..." : stats?.totalProducts || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingDown className="text-orange-500" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {statsLoading ? "..." : stats?.lowStockProducts || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingDown className="text-destructive" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
