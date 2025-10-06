import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { X, User } from "lucide-react";
import Cart from "@/components/pos/cart";
import ProductsGrid from "@/components/pos/products-grid";
import BarcodeScanner from "@/components/pos/barcode-scanner";
import { useAuthStore } from "@/hooks/use-woocommerce";

export default function POS() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  return (
    <div className="p-6 space-y-6" data-testid="pos-page">
      {/* POS Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Point of Sale</h2>
          <p className="text-sm text-muted-foreground">Fast checkout interface</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-xs text-muted-foreground">Cashier</p>
            <p className="text-sm font-semibold text-foreground flex items-center">
              <User size={16} className="mr-1" />
              {user?.displayName || 'Admin User'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center space-x-2"
            data-testid="close-pos-button"
          >
            <X size={16} />
            <span>Close POS</span>
          </Button>
        </div>
      </div>

      {/* POS Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <BarcodeScanner />
          <ProductsGrid />
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Cart />
        </div>
      </div>
    </div>
  );
}
