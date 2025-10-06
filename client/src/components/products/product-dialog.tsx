import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/queryClient";
import axios from "axios";

interface ProductFormData {
  name: string;
  sku: string;
  regularPrice: string;
  salePrice?: string;
  stockQuantity: number;
  manageStock: boolean;
  stockStatus: string;
  shortDescription?: string;
  description?: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  mode: "create" | "edit";
}

export function ProductDialog({ open, onOpenChange, product, mode }: ProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      sku: "",
      regularPrice: "0",
      salePrice: "",
      stockQuantity: 0,
      manageStock: true,
      stockStatus: "instock",
      shortDescription: "",
      description: "",
    },
  });

  const manageStock = watch("manageStock");

  useEffect(() => {
    if (product && mode === "edit") {
      reset({
        name: product.name || "",
        sku: product.sku || "",
        regularPrice: product.regularPrice || "0",
        salePrice: product.salePrice || "",
        stockQuantity: product.stockQuantity || 0,
        manageStock: product.manageStock || false,
        stockStatus: product.stockStatus || "instock",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
      });
    } else if (mode === "create") {
      reset({
        name: "",
        sku: "",
        regularPrice: "0",
        salePrice: "",
        stockQuantity: 0,
        manageStock: true,
        stockStatus: "instock",
        shortDescription: "",
        description: "",
      });
    }
  }, [product, mode, reset]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const token = getAuthToken();
      const response = await axios.post("/api/products", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produk berhasil dibuat",
        description: "Produk baru telah ditambahkan ke katalog",
      });
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal membuat produk",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const token = getAuthToken();
      const response = await axios.put(`/api/products/${product.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produk berhasil diperbarui",
        description: "Perubahan telah disimpan",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui produk",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (mode === "create") {
      createProductMutation.mutate(data);
    } else {
      updateProductMutation.mutate(data);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Masukkan detail produk baru yang akan ditambahkan ke WooCommerce"
              : "Perbarui informasi produk"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              {...register("name", { required: "Nama produk wajib diisi" })}
              placeholder="Masukkan nama produk"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                {...register("sku")}
                placeholder="Kode produk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regularPrice">Harga Regular *</Label>
              <Input
                id="regularPrice"
                type="number"
                step="0.01"
                {...register("regularPrice", { required: "Harga wajib diisi" })}
                placeholder="0.00"
              />
              {errors.regularPrice && (
                <p className="text-sm text-destructive">{errors.regularPrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Harga Diskon</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                {...register("salePrice")}
                placeholder="0.00 (opsional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockStatus">Status Stok</Label>
              <select
                id="stockStatus"
                {...register("stockStatus")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="onbackorder">On Backorder</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="manageStock"
                checked={manageStock}
                onCheckedChange={(checked) => setValue("manageStock", checked)}
              />
              <Label htmlFor="manageStock">Kelola stok</Label>
            </div>
          </div>

          {manageStock && (
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Jumlah Stok</Label>
              <Input
                id="stockQuantity"
                type="number"
                {...register("stockQuantity", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Deskripsi Singkat</Label>
            <Textarea
              id="shortDescription"
              {...register("shortDescription")}
              placeholder="Deskripsi singkat produk"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Deskripsi lengkap produk"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : mode === "create" ? "Tambah Produk" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
