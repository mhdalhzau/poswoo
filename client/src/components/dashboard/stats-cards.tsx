import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { woocommerce } from "@/lib/woocommerce";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  AlertTriangle 
} from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => woocommerce.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Today's Sales",
      value: `$${stats?.todaysSales || "0.00"}`,
      icon: DollarSign,
      change: "+12.5%",
      comparison: "vs. yesterday",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Orders Today", 
      value: stats?.todaysOrders || 0,
      icon: ShoppingCart,
      change: "+8.2%",
      comparison: "vs. yesterday",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      change: "+15.3%", 
      comparison: "new this month",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Products in Stock",
      value: stats?.totalProducts || 0,
      icon: Package,
      change: stats?.lowStockProducts ? `${stats.lowStockProducts} low stock` : "All stocked",
      comparison: "items need restock",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      alert: stats?.lowStockProducts && stats.lowStockProducts > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`stat-card-${card.title.toLowerCase().replace(/ /g, '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.color} text-xl`} size={24} />
                </div>
                <span className={`text-xs font-medium flex items-center ${card.alert ? 'text-destructive' : 'text-accent'}`}>
                  {card.alert ? (
                    <AlertTriangle size={12} className="mr-1" />
                  ) : (
                    <TrendingUp size={12} className="mr-1" />
                  )}
                  {card.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1" data-testid={`stat-value-${card.title.toLowerCase().replace(/ /g, '-')}`}>
                {card.value}
              </h3>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>{card.comparison}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
