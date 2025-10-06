import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/hooks/use-woocommerce";
import { woocommerce } from "@/lib/woocommerce";
import { Camera, Search } from "lucide-react";

export default function BarcodeScanner() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Try barcode search first
      let product;
      try {
        product = await woocommerce.searchProductByBarcode(searchQuery);
      } catch {
        // If barcode search fails, try regular product search
        const products = await woocommerce.getProducts({ search: searchQuery, per_page: 1 });
        if (products && products.length > 0) {
          product = products[0];
        }
      }

      if (product) {
        addItem(product);
        setSearchQuery("");
        toast({
          title: "Product added",
          description: `${product.name} added to cart`,
        });
      } else {
        toast({
          title: "Product not found",
          description: "No product found with that search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search for product",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    // In a real implementation, this would start/stop camera scanning
    toast({
      title: isScanning ? "Scanner stopped" : "Scanner started",
      description: isScanning ? "Camera scanning disabled" : "Point camera at barcode to scan",
    });
  };

  useEffect(() => {
    // Focus search input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Listen for barcode scanner input (keyboard wedge mode)
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Most barcode scanners end with Enter/Return
      if (e.key === "Enter" && searchQuery && document.activeElement === inputRef.current) {
        handleSearch();
      }
    };

    window.addEventListener("keypress", handleGlobalKeyPress);
    return () => window.removeEventListener("keypress", handleGlobalKeyPress);
  }, [searchQuery]);

  return (
    <Card className="border border-border" data-testid="barcode-scanner">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search products by name or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12"
              data-testid="product-search-input"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          </div>
          <Button
            onClick={toggleScanner}
            variant={isScanning ? "default" : "outline"}
            className="flex items-center space-x-2"
            data-testid="barcode-scanner-toggle"
          >
            <Camera size={16} />
            <span>{isScanning ? "Stop" : "Scan"}</span>
          </Button>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            data-testid="search-button"
          >
            <Search size={16} />
          </Button>
        </div>

        {isScanning && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-center">
            <div className="w-48 h-32 mx-auto bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground">
                <Camera size={32} className="mx-auto mb-2" />
                <p className="text-sm">Camera scanning active</p>
                <p className="text-xs">Point at barcode</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
