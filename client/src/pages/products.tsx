import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { woocommerce } from "@/lib/woocommerce";
import { 
  Search, 
  Package, 
  Edit, 
  Eye, 
  AlertTriangle,
  FolderSync,
  Filter
} from "lucide-react";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["/api/products", searchQuery, selectedCategory],
    queryFn: () => woocommerce.getProducts({ 
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      per_page: 50 
    }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const syncProducts = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Failed to sync products:", error);
    }
  };

  const getStockStatus = (product: any) => {
    if (product.stockStatus === 'outofstock') {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    
    if (product.stockQuantity !== null && product.stockQuantity < 10) {
      return <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertTriangle size={12} />
        <span>Low Stock ({product.stockQuantity})</span>
      </Badge>;
    }
    
    if (product.stockQuantity !== null) {
      return <Badge variant="secondary">In Stock ({product.stockQuantity})</Badge>;
    }

    return <Badge variant="secondary">Available</Badge>;
  };

  return (
    <div className="p-6 space-y-6" data-testid="products-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={syncProducts}
            variant="outline"
            className="flex items-center space-x-2"
            data-testid="sync-products-button"
          >
            <FolderSync size={16} />
            <span>FolderSync from WooCommerce</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="product-search-input"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
            <Button type="submit" data-testid="search-button">
              <Search size={16} />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Product Catalog</span>
            <span className="text-sm font-normal text-muted-foreground">
              {products?.length || 0} products
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : products && products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0].src}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="text-muted-foreground" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.shortDescription || 'No description'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {product.sku || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          {product.salePrice && product.salePrice !== product.regularPrice ? (
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">${product.salePrice}</p>
                              <p className="text-xs text-muted-foreground line-through">
                                ${product.regularPrice}
                              </p>
                            </div>
                          ) : (
                            <p className="font-semibold text-foreground">
                              ${product.price || product.regularPrice || '0.00'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStockStatus(product)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.categories && product.categories.length > 0 ? (
                            product.categories.slice(0, 2).map((category: any) => (
                              <Badge key={category.id} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Uncategorized</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            data-testid={`view-product-${product.id}`}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            data-testid={`edit-product-${product.id}`}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <Package size={48} className="text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium text-foreground mb-1">No products found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery 
                              ? "Try adjusting your search terms" 
                              : "Connect to WooCommerce to sync your products"
                            }
                          </p>
                        </div>
                        {!searchQuery && (
                          <Button onClick={syncProducts} className="mt-4">
                            <FolderSync size={16} className="mr-2" />
                            FolderSync Products
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
