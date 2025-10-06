import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/hooks/use-woocommerce";
import { woocommerce } from "@/lib/woocommerce";
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  User, 
  UserPlus,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpDown,
  Pause,
  Check
} from "lucide-react";

export default function Cart() {
  const [discountInput, setDiscountInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    items,
    subtotal,
    discount,
    tax,
    total,
    selectedCustomer,
    paymentMethod,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    setCustomer,
    setPaymentMethod,
    clearCart,
  } = useCartStore();

  const { toast } = useToast();

  const applyDiscount = () => {
    const discountValue = parseFloat(discountInput) || 0;
    setDiscount(discountValue);
    toast({
      title: "Discount applied",
      description: `$${discountValue.toFixed(2)} discount applied to cart`,
    });
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCustomerChange = (customerId: string) => {
    if (customerId === "walk-in") {
      setCustomer(null);
    } else {
      // In a real implementation, fetch customer data
      setCustomer({ id: customerId, name: "Customer Name", email: "customer@email.com" });
    }
  };

  const processCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || "Walk-in Customer",
        customerEmail: selectedCustomer?.email || null,
        status: "completed",
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        subtotal: subtotal.toString(),
        discount: discount.toString(),
        tax: tax.toString(),
        total: total.toString(),
        paymentMethod,
        amountPaid: total.toString(),
        change: "0.00",
        receiptPrinted: false,
      };

      const order = await woocommerce.createOrder(orderData);
      
      toast({
        title: "Order completed",
        description: `Order ${order.orderId} has been processed successfully`,
      });

      // Clear cart after successful order
      clearCart();
      
    } catch (error) {
      console.error("Checkout failed:", error);
      toast({
        title: "Checkout failed",
        description: "Failed to process order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const holdOrder = () => {
    toast({
      title: "Order held",
      description: "Current order has been saved for later",
    });
  };

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "card", label: "Card", icon: CreditCard },
    { value: "digital", label: "Digital", icon: Smartphone },
    { value: "split", label: "Split", icon: ArrowUpDown },
  ];

  return (
    <div className="space-y-4" data-testid="pos-cart">
      {/* Customer Selection */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-foreground mb-2">Customer</label>
          <div className="flex items-center space-x-2">
            <Select onValueChange={handleCustomerChange} defaultValue="walk-in">
              <SelectTrigger className="flex-1" data-testid="customer-select">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                <SelectItem value="customer-1">John Doe</SelectItem>
                <SelectItem value="customer-2">Sarah Miller</SelectItem>
                <SelectItem value="customer-3">Michael Wilson</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center space-x-1"
              data-testid="add-customer-button"
            >
              <UserPlus size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cart Items */}
      <Card className="overflow-hidden flex flex-col" style={{ height: "calc(100vh - 520px)", minHeight: "300px" }}>
        <CardHeader className="pb-3 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <ShoppingCart size={16} />
              <span>Cart Items</span>
            </CardTitle>
            {items.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                className="text-destructive hover:text-destructive/80 text-xs"
                data-testid="clear-cart-button"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-cart">
              <ShoppingCart size={48} className="text-4xl text-muted-foreground mb-3 mx-auto" />
              <p className="text-sm text-muted-foreground">No items in cart</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start space-x-3 pb-3 border-b border-border last:border-0"
                data-testid={`cart-item-${item.id}`}
              >
                <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart className="text-muted-foreground" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground mb-1">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">${item.price.toFixed(2)}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="h-6 w-6 p-0"
                      data-testid={`decrease-quantity-${item.id}`}
                    >
                      <Minus size={12} />
                    </Button>
                    <span className="text-sm font-medium min-w-[24px] text-center" data-testid={`quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                      data-testid={`increase-quantity-${item.id}`}
                    >
                      <Plus size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-destructive hover:text-destructive/80 h-6 w-6 p-0"
                      data-testid={`remove-item-${item.id}`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <>
          {/* Cart Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {/* Discount Input */}
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Discount amount"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="flex-1"
                  data-testid="discount-input"
                />
                <Button
                  onClick={applyDiscount}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  data-testid="apply-discount-button"
                >
                  Apply
                </Button>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground" data-testid="cart-subtotal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-destructive" data-testid="cart-discount">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium text-foreground" data-testid="cart-tax">
                    ${tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary" data-testid="cart-total">
                  ${total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-foreground mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.value;
                  
                  return (
                    <Button
                      key={method.value}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method.value)}
                      className="flex items-center justify-center space-x-2 h-12"
                      data-testid={`payment-method-${method.value}`}
                    >
                      <Icon size={16} />
                      <span>{method.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Checkout Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={holdOrder}
              className="flex items-center space-x-2 h-12"
              data-testid="hold-order-button"
            >
              <Pause size={16} />
              <span>Hold</span>
            </Button>
            <Button
              onClick={processCheckout}
              disabled={isProcessing}
              className="flex items-center space-x-2 h-12 bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="checkout-button"
            >
              <Check size={16} />
              <span>{isProcessing ? "Processing..." : "Checkout"}</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
