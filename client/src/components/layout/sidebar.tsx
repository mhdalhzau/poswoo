import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-woocommerce";
import {
  BarChart3,
  ScanBarcode,
  Package,
  Users,
  Warehouse,
  FileBarChart,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, shortcut: "" },
  { name: "POS Cashier", href: "/pos", icon: ScanBarcode, shortcut: "F2" },
  { name: "Products", href: "/products", icon: Package, shortcut: "" },
  { name: "Customers", href: "/customers", icon: Users, shortcut: "" },
  { name: "Inventory", href: "/inventory", icon: Warehouse, shortcut: "" },
  { name: "Reports", href: "/reports", icon: FileBarChart, shortcut: "" },
  { name: "Settings", href: "/settings", icon: Settings, shortcut: "" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        window.location.href = "/pos";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden lg:flex flex-col" data-testid="sidebar">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <ScanBarcode className="text-primary-foreground text-lg" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">DreamPOS</h1>
            <p className="text-xs text-muted-foreground">WooCommerce POS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                    {item.shortcut}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <User className="text-muted-foreground" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="user-name">
              {user?.displayName || "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="user-email">
              {user?.email || "admin@store.com"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
            data-testid="logout-button"
          >
            <LogOut size={16} />
          </Button>
        </div>

        <div className="mt-3 px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">WooCommerce</span>
            <span className="flex items-center text-accent font-medium">
              <div className="w-1.5 h-1.5 bg-accent rounded-full mr-1.5" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
