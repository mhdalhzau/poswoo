import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/hooks/use-woocommerce";
import { woocommerce } from "@/lib/woocommerce";
import { Package } from "lucide-react";

const categories = [
  { id: "all", name: "All Products" },
  { id: "electronics", name: "Electronics" },
  { id: "accessories", name: "Accessories" },
  { id: "clothing", name: "Clothing" },
  { id: "home", name: "Home & Living" },
];

export default function ProductsGrid() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory],
    queryFn: () => woocommerce.getProducts({ 
      per_page: 50,
      ...(selectedCategory !== "all" && { category: selectedCategory })
    }),
  });

  const handleAddToCart = (product: any) => {
    if (product.stockStatus === 'outofstock') {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} added to cart`,
    });
  };

  const getStockBadge = (product: any) => {
    const stockQuantity = product.stockQuantity;
    const stockStatus = product.stockStatus;

    if (stockStatus === 'outofstock') {
      return <Badge variant="destructive" className="text-xs">Out of stock</Badge>;
    }
    
    if (stockQuantity !== null && stockQuantity < 10) {
      return <Badge variant="destructive" className="text-xs">{stockQuantity} left</Badge>;
    }
    
    if (stockQuantity !== null) {
      return <Badge variant="secondary" className="text-xs">{stockQuantity} left</Badge>;
    }

    return <Badge variant="secondary" className="text-xs">In stock</Badge>;
  };

  return (
    <div className="space-y-4" data-testid="products-grid">
      {/* Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
            data-testid={`category-filter-${category.id}`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Skeleton className="aspect-square rounded-lg mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-16 mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAddToCart(product)}
              data-testid={`product-card-${product.id}`}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0].src}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="text-4xl text-muted-foreground" size={48} />
                  )}
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
                  {product.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  SKU: {product.sku || 'N/A'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${product.price || '0.00'}
                  </span>
                  {getStockBadge(product)}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Package className="mx-auto mb-4" size={48} />
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="text-sm">Try selecting a different category or check your WooCommerce connection</p>
          </div>
        )}
      </div>
    </div>
  );
}
