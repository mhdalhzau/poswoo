import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { woocommerce } from "@/lib/woocommerce";
import { Eye, Printer, ArrowRight, User, CreditCard, Banknote } from "lucide-react";

export default function RecentOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => woocommerce.getOrders(10),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCard size={12} />;
      case 'cash':
        return <Banknote size={12} />;
      default:
        return <CreditCard size={12} />;
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <Card className="shadow-sm overflow-hidden" data-testid="recent-orders">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground">Latest transactions from POS and online</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-medium">
            View All <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : orders && orders.length > 0 ? (
                orders.map((order) => {
                  const { date, time } = formatDate(order.createdAt);
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors" data-testid={`order-row-${order.orderId}`}>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-primary">
                          {order.orderId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {getInitials(order.customerName || 'Walk-in')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {order.customerName || 'Walk-in Customer'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.customerEmail || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{date}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-foreground">
                          ${order.total}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="flex items-center space-x-1 w-fit">
                          {getPaymentIcon(order.paymentMethod)}
                          <span className="capitalize">{order.paymentMethod}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 'secondary'}
                          className={order.status === 'completed' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                            data-testid={`view-order-${order.orderId}`}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                            data-testid={`print-order-${order.orderId}`}
                          >
                            <Printer size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center space-y-2">
                      <User size={32} />
                      <p className="text-sm">No recent orders found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
