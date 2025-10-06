import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Minus } from "lucide-react";

interface StockAdjustmentFormData {
  amount: number;
  notes?: string;
}

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
}

export function StockAdjustmentDialog({ open, onOpenChange, product }: StockAdjustmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StockAdjustmentFormData>({
    defaultValues: {
      amount: 0,
      notes: "",
    },
  });

  const currentStock = product?.stockQuantity || 0;
  const watchAmount = watch("amount", 0);

  const adjustStockMutation = useMutation({
    mutationFn: async (data: StockAdjustmentFormData) => {
      const response = await apiRequest(
        'POST',
        `/api/products/${product.id}/stock-adjustments`,
        {
          type: adjustmentType,
          amount: data.amount,
          notes: data.notes,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", product.id, "stock-adjustments"] });
      toast({
        title: "Stok berhasil diperbarui",
        description: `Stok ${adjustmentType === "add" ? "ditambah" : "dikurangi"} sebanyak ${watchAmount} unit`,
      });
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui stok",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StockAdjustmentFormData) => {
    if (data.amount <= 0) {
      toast({
        title: "Jumlah tidak valid",
        description: "Jumlah harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }
    adjustStockMutation.mutate(data);
  };

  const calculateNewStock = (amount: number) => {
    const adjustment = adjustmentType === "add" ? amount : -amount;
    return currentStock + adjustment;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjustment Stok</DialogTitle>
          <DialogDescription>
            Tambah atau kurangi stok untuk: <strong>{product?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Stok Saat Ini:</span>
              <span className="text-2xl font-bold">{currentStock} unit</span>
            </div>
          </div>

          <Tabs value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as "add" | "subtract")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Tambah Stok</span>
              </TabsTrigger>
              <TabsTrigger value="subtract" className="flex items-center space-x-2">
                <Minus size={16} />
                <span>Kurangi Stok</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={adjustmentType}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Jumlah {adjustmentType === "add" ? "Penambahan" : "Pengurangan"}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    data-testid="input-adjustment-amount"
                    {...register("amount", { 
                      required: "Jumlah wajib diisi",
                      valueAsNumber: true,
                      min: { value: 1, message: "Jumlah minimal 1" }
                    })}
                    placeholder="Masukkan jumlah"
                  />
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea
                    id="notes"
                    data-testid="textarea-adjustment-notes"
                    {...register("notes")}
                    placeholder="Alasan adjustment stok"
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stok Baru:</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-new-stock">
                      {calculateNewStock(watchAmount || 0)} unit
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      reset();
                    }}
                    disabled={adjustStockMutation.isPending}
                    data-testid="button-cancel-adjustment"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={adjustStockMutation.isPending}
                    data-testid="button-submit-adjustment"
                  >
                    {adjustStockMutation.isPending
                      ? "Menyimpan..."
                      : adjustmentType === "add"
                      ? "Tambah Stok"
                      : "Kurangi Stok"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
