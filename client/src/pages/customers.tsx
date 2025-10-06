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
  Users, 
  Eye, 
  Mail,
  Phone,
  MapPin,
  FolderSync,
  UserPlus
} from "lucide-react";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ["/api/customers", searchQuery],
    queryFn: () => woocommerce.getCustomers({ 
      search: searchQuery || undefined,
      per_page: 50 
    }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address';
    const parts = [
      address.address1,
      address.city,
      address.state,
      address.postcode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  return (
    <div className="p-6 space-y-6" data-testid="customers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customers</h2>
          <p className="text-sm text-muted-foreground">Manage customer information and order history</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={refetch}
            variant="outline"
            className="flex items-center space-x-2"
            data-testid="sync-customers-button"
          >
            <FolderSync size={16} />
            <span>FolderSync from WooCommerce</span>
          </Button>
          <Button
            className="flex items-center space-x-2"
            data-testid="add-customer-button"
          >
            <UserPlus size={16} />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="customer-search-input"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
            <Button type="submit" data-testid="search-button">
              <Search size={16} />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Directory</span>
            <span className="text-sm font-normal text-muted-foreground">
              {customers?.length || 0} customers
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Date Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id} data-testid={`customer-row-${customer.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            {customer.avatarUrl ? (
                              <img
                                src={customer.avatarUrl}
                                alt={customer.displayName || customer.email}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-muted-foreground">
                                {getInitials(customer.firstName, customer.lastName)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {customer.displayName || `${customer.firstName} ${customer.lastName}`.trim() || 'No name'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {customer.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail size={14} className="text-muted-foreground" />
                            <span className="text-foreground">{customer.email}</span>
                          </div>
                          {customer.billing?.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone size={14} className="text-muted-foreground" />
                              <span className="text-muted-foreground">{customer.billing.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {formatAddress(customer.billing)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{customer.ordersCount || 0}</p>
                          <p className="text-xs text-muted-foreground">orders</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">
                          ${customer.totalSpent || '0.00'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">
                          {customer.dateCreated ? 
                            new Date(customer.dateCreated).toLocaleDateString() : 
                            'Unknown'
                          }
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          data-testid={`view-customer-${customer.id}`}
                        >
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <Users size={48} className="text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium text-foreground mb-1">No customers found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery 
                              ? "Try adjusting your search terms" 
                              : "Connect to WooCommerce to sync your customers"
                            }
                          </p>
                        </div>
                        {!searchQuery && (
                          <Button onClick={refetch} className="mt-4">
                            <FolderSync size={16} className="mr-2" />
                            FolderSync Customers
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
