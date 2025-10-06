import StatsCards from "@/components/dashboard/stats-cards";
import SalesChart from "@/components/dashboard/sales-chart";
import TopProducts from "@/components/dashboard/top-products";
import RecentOrders from "@/components/dashboard/recent-orders";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <TopProducts />
        </div>
      </div>
      
      <RecentOrders />
    </div>
  );
}
