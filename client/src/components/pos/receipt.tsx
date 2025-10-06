import { forwardRef } from "react";

interface ReceiptItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface ReceiptData {
  orderId: string;
  date: string;
  time: string;
  cashier: string;
  customer: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
}

interface ReceiptProps {
  data: ReceiptData;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeWebsite?: string;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ data, storeName = "Your Store Name", storeAddress = "123 Main Street, City, State 12345", storePhone = "(555) 123-4567", storeWebsite = "www.yourstore.com" }, ref) => {
    return (
      <div ref={ref} className="max-w-[80mm] mx-auto p-4 font-mono text-sm bg-white text-black" data-testid="receipt">
        {/* Header */}
        <div className="text-center mb-4 border-b-2 border-black pb-3">
          <h1 className="text-xl font-bold mb-1">{storeName}</h1>
          <p className="text-xs">{storeAddress}</p>
          <p className="text-xs">Phone: {storePhone}</p>
        </div>

        {/* Order Info */}
        <div className="mb-3 text-xs">
          <p><strong>Order:</strong> {data.orderId}</p>
          <p><strong>Date:</strong> {data.date} {data.time}</p>
          <p><strong>Cashier:</strong> {data.cashier}</p>
          <p><strong>Customer:</strong> {data.customer}</p>
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-3 border-t-2 border-b-2 border-black py-2">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="py-1">{item.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">${item.price.toFixed(2)}</td>
                <td className="text-right">${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="text-xs space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${data.subtotal.toFixed(2)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-${data.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${data.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t-2 border-black pt-2">
            <span>TOTAL:</span>
            <span>${data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="text-xs mb-3">
          <p><strong>Payment Method:</strong> {data.paymentMethod}</p>
          <p><strong>Amount Paid:</strong> ${data.amountPaid.toFixed(2)}</p>
          {data.change > 0 && (
            <p><strong>Change:</strong> ${data.change.toFixed(2)}</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs border-t-2 border-black pt-3">
          <p className="mb-2">Thank you for your purchase!</p>
          <p className="mb-2">Visit us again soon</p>
          <p className="text-xs opacity-75">{storeWebsite}</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";

export default Receipt;

// Print utility function
export const printReceipt = (receiptRef: React.RefObject<HTMLDivElement>) => {
  if (!receiptRef.current) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const receiptContent = receiptRef.current.innerHTML;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            @page { margin: 0; size: 80mm auto; }
          }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: none; padding: 2px; }
          .border-t-2 { border-top: 2px solid black; }
          .border-b-2 { border-bottom: 2px solid black; }
          .border-black { border: 1px solid black; }
          .font-bold { font-weight: bold; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mb-4 { margin-bottom: 16px; }
          .pb-3 { padding-bottom: 12px; }
          .pt-2 { padding-top: 8px; }
          .pt-3 { padding-top: 12px; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .opacity-75 { opacity: 0.75; }
          .text-xs { font-size: 10px; }
          .text-xl { font-size: 18px; }
          .text-base { font-size: 12px; }
        </style>
      </head>
      <body>
        ${receiptContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};
