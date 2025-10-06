import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronDown, ChevronUp, History, TrendingUp, TrendingDown, Edit3 } from "lucide-react";
import { useState } from "react";

interface StockHistoryProps {
  productId: number;
  productName: string;
}

export function StockHistory({ productId, productName }: StockHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [limit, setLimit] = useState(10);

  const { data: adjustments, isLoading } = useQuery({
    queryKey: ["/api/products", productId, "stock-adjustments", limit],
    queryFn: async () => {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/products/${productId}/stock-adjustments?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch stock history");
      return response.json();
    },
    enabled: isOpen,
  });

  const getAdjustmentTypeBadge = (type: string) => {
    switch (type) {
      case "add":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1" data-testid={`badge-type-add`}>
            <TrendingUp size={12} />
            <span>Tambah</span>
          </Badge>
        );
      case "subtract":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1" data-testid={`badge-type-subtract`}>
            <TrendingDown size={12} />
            <span>Kurang</span>
          </Badge>
        );
      case "set":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1" data-testid={`badge-type-set`}>
            <Edit3 size={12} />
            <span>Set</span>
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getChangeDisplay = (change: number) => {
    if (change > 0) {
      return (
        <span className="text-green-600 font-semibold" data-testid="text-change-positive">
          +{change}
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="text-red-600 font-semibold" data-testid="text-change-negative">
          {change}
        </span>
      );
    }
    return <span className="text-muted-foreground">0</span>;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 w-full justify-between p-4 h-auto"
          data-testid={`button-toggle-history-${productId}`}
        >
          <div className="flex items-center gap-2">
            <History size={16} />
            <span className="font-medium">History Stok: {productName}</span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : adjustments && adjustments.length > 0 ? (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Sebelum</TableHead>
                      <TableHead>Sesudah</TableHead>
                      <TableHead>Perubahan</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adjustment: any) => (
                      <TableRow key={adjustment.id} data-testid={`history-row-${adjustment.id}`}>
                        <TableCell className="text-sm">
                          {format(new Date(adjustment.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                        </TableCell>
                        <TableCell className="font-medium">{adjustment.username}</TableCell>
                        <TableCell>{getAdjustmentTypeBadge(adjustment.adjustmentType)}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{adjustment.quantityBefore}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{adjustment.quantityAfter}</span>
                        </TableCell>
                        <TableCell>{getChangeDisplay(adjustment.quantityChange)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {adjustment.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {adjustments.length >= limit && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLimit(limit + 10)}
                    data-testid="button-load-more-history"
                  >
                    Muat Lebih Banyak
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center" data-testid="empty-history">
              <History size={48} className="text-muted-foreground mb-2" />
              <p className="text-lg font-medium text-foreground">Belum Ada History</p>
              <p className="text-sm text-muted-foreground">
                History adjustment stok akan muncul di sini
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
