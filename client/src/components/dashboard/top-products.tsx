import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { woocommerce } from "@/lib/woocommerce";
import { Package } from "lucide-react";

export default function TopProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => woocommerce.getProducts({ per_page: 5 }),
  });

  return (
    <Card className="shadow-sm" data-testid="top-products">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Top Products</CardTitle>
        <p className="text-sm text-muted-foreground">Best sellers this week</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-3" data-testid={`top-product-${index}`}>
                <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                  {product.images && product.images[0] ? (
                    <img 
                      src={product.images[0].src} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="text-muted-foreground" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {product.stockQuantity || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${product.price || "0.00"}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto mb-2" size={32} />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
