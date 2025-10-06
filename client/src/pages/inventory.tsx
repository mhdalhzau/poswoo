import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  AlertTriangle,
  TrendingDown,
  FolderSync,
  Download,
  Edit,
  Trash2,
  History,
  Activity
} from "lucide-react";
import { ProductDialog } from "@/components/products/product-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog";
import { StockHistory } from "@/components/inventory/stock-history";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockAdjustmentDialogOpen, setStockAdjustmentDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => woocommerce.getProducts({ per_page: 100 }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "low-stock") {
      return matchesSearch && product.stockQuantity !== null && product.stockQuantity < 10;
    }
    if (activeTab === "out-of-stock") {
      return matchesSearch && product.stockStatus === 'outofstock';
    }
    return matchesSearch;
  }) || [];

  const getStockStatusBadge = (product: any) => {
    if (product.stockStatus === 'outofstock') {
      return <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertTriangle size={12} />
        <span>Out of Stock</span>
      </Badge>;
    }
    
    if (product.stockQuantity !== null && product.stockQuantity < 10) {
      return <Badge variant="destructive" className="flex items-center space-x-1">
        <TrendingDown size={12} />
        <span>Low Stock</span>
      </Badge>;
    }
    
    return <Badge variant="secondary">In Stock</Badge>;
  };

  const getStockLevel = (product: any) => {
    if (product.stockQuantity === null) {
      return product.stockStatus === 'instock' ? 'Available' : 'Unavailable';
    }
    return product.stockQuantity.toString();
  };

  const inventoryStats = {
    total: products?.length || 0,
    lowStock: products?.filter(p => p.stockQuantity !== null && p.stockQuantity < 10).length || 0,
    outOfStock: products?.filter(p => p.stockStatus === 'outofstock').length || 0,
    inStock: products?.filter(p => p.stockStatus === 'instock').length || 0,
  };

  const handleEditProduct = (product: any) => {
    setDialogMode("edit");
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = (product: any) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleStockAdjustment = (product: any) => {
    setSelectedProduct(product);
    setStockAdjustmentDialogOpen(true);
  };

  const handleViewHistory = (product: any) => {
    setSelectedProduct(product);
    setHistoryDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6" data-testid="inventory-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-sm text-muted-foreground">Track stock levels and manage inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            data-testid="export-inventory-button"
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
          <Button
            onClick={refetch}
            variant="outline"
            className="flex items-center space-x-2"
            data-testid="sync-inventory-button"
          >
            <FolderSync size={16} />
            <span>FolderSync Inventory</span>
          </Button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="text-primary" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{inventoryStats.total}</h3>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Package className="text-accent" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{inventoryStats.inStock}</h3>
            <p className="text-sm text-muted-foreground">In Stock</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-orange-500" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{inventoryStats.lowStock}</h3>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-destructive" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{inventoryStats.outOfStock}</h3>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search inventory by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="inventory-search-input"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
            <Button type="submit" data-testid="search-button">
              <Search size={16} />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Inventory Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" data-testid="tab-all">All Items ({inventoryStats.total})</TabsTrigger>
                <TabsTrigger value="in-stock" data-testid="tab-in-stock">In Stock ({inventoryStats.inStock})</TabsTrigger>
                <TabsTrigger value="low-stock" data-testid="tab-low-stock">Low Stock ({inventoryStats.lowStock})</TabsTrigger>
                <TabsTrigger value="out-of-stock" data-testid="tab-out-of-stock">Out of Stock ({inventoryStats.outOfStock})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Last Updated</TableHead>
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
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id} data-testid={`inventory-row-${product.id}`}>
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
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {product.sku || 'N/A'}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">
                                {getStockLevel(product)}
                              </p>
                              {product.stockQuantity !== null && (
                                <p className="text-xs text-muted-foreground">units</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStockStatusBadge(product)}
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-foreground">
                              ${product.price || product.regularPrice || '0.00'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {product.lastSyncAt ? 
                                new Date(product.lastSyncAt).toLocaleDateString() : 
                                'Never'
                              }
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStockAdjustment(product)}
                                data-testid={`adjust-stock-${product.id}`}
                                title="Adjustment Stok"
                              >
                                <Activity size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewHistory(product)}
                                data-testid={`view-history-${product.id}`}
                                title="Lihat History"
                              >
                                <History size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditProduct(product)}
                                data-testid={`edit-inventory-${product.id}`}
                                title="Edit Produk"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProduct(product)}
                                data-testid={`delete-inventory-${product.id}`}
                                title="Hapus Produk"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <Package size={48} className="text-muted-foreground" />
                            <div>
                              <p className="text-lg font-medium text-foreground mb-1">No inventory found</p>
                              <p className="text-sm text-muted-foreground">
                                {searchQuery 
                                  ? "Try adjusting your search terms" 
                                  : "Connect to WooCommerce to sync your inventory"
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        mode={dialogMode}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
      />

      <StockAdjustmentDialog
        open={stockAdjustmentDialogOpen}
        onOpenChange={setStockAdjustmentDialogOpen}
        product={selectedProduct}
      />

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>History Adjustment Stok</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <StockHistory
              productId={selectedProduct.id}
              productName={selectedProduct.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
