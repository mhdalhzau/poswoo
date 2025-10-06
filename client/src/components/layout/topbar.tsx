import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Bell, ScanBarcode } from "lucide-react";

const pageInfo = {
  "/": { title: "Dashboard", description: "Overview of your store performance" },
  "/dashboard": { title: "Dashboard", description: "Overview of your store performance" },
  "/pos": { title: "Point of Sale", description: "Fast checkout interface" },
  "/products": { title: "Products", description: "Manage your product catalog" },
  "/customers": { title: "Customers", description: "Manage customer information" },
  "/inventory": { title: "Inventory", description: "Track stock levels and manage inventory" },
  "/reports": { title: "Reports", description: "Sales analytics and reporting" },
  "/settings": { title: "Settings", description: "Configure WooCommerce integration and POS preferences" },
};

export default function Topbar() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const currentPage = pageInfo[location as keyof typeof pageInfo] || {
    title: "DreamPOS",
    description: "WooCommerce Point of Sale"
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
      
      // F2 for POS
      if (e.key === "F2") {
        e.preventDefault();
        setLocation("/pos");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLocation]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Handle global search
      console.log("Search:", searchQuery);
    }
  };

  const openPOS = () => {
    setLocation("/pos");
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10" data-testid="topbar">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-foreground"
            data-testid="mobile-menu-toggle"
          >
            <Menu size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{currentPage.title}</h2>
            <p className="text-sm text-muted-foreground">{currentPage.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Input
              id="global-search"
              type="text"
              placeholder="Search products (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-64 pl-10"
              data-testid="search-input"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          </div>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            data-testid="notifications-button"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          
          {/* Open POS */}
          <Button
            onClick={openPOS}
            className="flex items-center space-x-2 shadow-sm"
            data-testid="open-pos-button"
          >
            <ScanBarcode size={16} />
            <span className="hidden sm:inline">Open POS</span>
            <span className="text-xs opacity-75">F2</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
