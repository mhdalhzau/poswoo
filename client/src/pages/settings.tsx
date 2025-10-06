import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/hooks/use-woocommerce";
import { woocommerce } from "@/lib/woocommerce";
import { queryClient } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon,
  Plug,
  ScanBarcode,
  Receipt,
  Users,
  FolderSync,
  Eye,
  EyeOff,
  TestTube,
  Save,
  RefreshCw
} from "lucide-react";

const settingsSchema = z.object({
  storeUrl: z.string().url("Please enter a valid URL"),
  consumerKey: z.string().min(1, "Consumer key is required"),
  consumerSecret: z.string().min(1, "Consumer secret is required"),
  cacheDuration: z.number().min(1).max(60),
  autoRefresh: z.boolean(),
  permissions: z.object({
    products: z.boolean(),
    orders: z.boolean(),
    customers: z.boolean(),
    inventory: z.boolean(),
  }),
});

type SettingsForm = z.infer<typeof settingsSchema>;

function SyncDataSection() {
  const { toast } = useToast();
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);
  const [isSyncingCustomers, setIsSyncingCustomers] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  const handleSyncProducts = async () => {
    setIsSyncingProducts(true);
    try {
      const result = await woocommerce.syncProducts();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Products synced",
        description: result.message || `Successfully synced ${result.count} products`,
      });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync products from WooCommerce",
        variant: "destructive",
      });
    } finally {
      setIsSyncingProducts(false);
    }
  };

  const handleSyncCustomers = async () => {
    setIsSyncingCustomers(true);
    try {
      const result = await woocommerce.syncCustomers();
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customers synced",
        description: result.message || `Successfully synced ${result.count} customers`,
      });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync customers from WooCommerce",
        variant: "destructive",
      });
    } finally {
      setIsSyncingCustomers(false);
    }
  };

  const handleFetchOrders = async () => {
    setIsFetchingOrders(true);
    try {
      const result = await woocommerce.fetchOrders();
      toast({
        title: "Orders fetched",
        description: result.message || `Successfully fetched ${result.count} orders`,
      });
    } catch (error: any) {
      toast({
        title: "Fetch failed",
        description: error.message || "Failed to fetch orders from WooCommerce",
        variant: "destructive",
      });
    } finally {
      setIsFetchingOrders(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Products</h3>
            <p className="text-xs text-muted-foreground">Sync all products from WooCommerce to local cache</p>
          </div>
          <Button
            onClick={handleSyncProducts}
            disabled={isSyncingProducts}
            size="sm"
            data-testid="sync-products-button"
          >
            {isSyncingProducts ? (
              <RefreshCw size={16} className="animate-spin mr-2" />
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            {isSyncingProducts ? "Syncing..." : "Sync Products"}
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Customers</h3>
            <p className="text-xs text-muted-foreground">Sync all customers from WooCommerce to local cache</p>
          </div>
          <Button
            onClick={handleSyncCustomers}
            disabled={isSyncingCustomers}
            size="sm"
            data-testid="sync-customers-button"
          >
            {isSyncingCustomers ? (
              <RefreshCw size={16} className="animate-spin mr-2" />
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            {isSyncingCustomers ? "Syncing..." : "Sync Customers"}
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Orders</h3>
            <p className="text-xs text-muted-foreground">Fetch latest orders from WooCommerce</p>
          </div>
          <Button
            onClick={handleFetchOrders}
            disabled={isFetchingOrders}
            size="sm"
            data-testid="fetch-orders-button"
          >
            {isFetchingOrders ? (
              <RefreshCw size={16} className="animate-spin mr-2" />
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            {isFetchingOrders ? "Fetching..." : "Fetch Orders"}
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Sync Information</h4>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
              Syncing may take time depending on your store size. Products and customers are cached locally for faster access. Orders are fetched in real-time and not cached.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("woocommerce");
  const [showConsumerKey, setShowConsumerKey] = useState(false);
  const [showConsumerSecret, setShowConsumerSecret] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const { toast } = useToast();
  const { settings, isConnected, setSettings, testConnection } = useSettingsStore();

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: () => woocommerce.getSettings(),
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeUrl: currentSettings?.storeUrl || "",
      consumerKey: currentSettings?.consumerKey || "",
      consumerSecret: currentSettings?.consumerSecret || "",
      cacheDuration: currentSettings?.cacheDuration || 5,
      autoRefresh: currentSettings?.autoRefresh || true,
      permissions: {
        products: true,
        orders: true,
        customers: true,
        inventory: true,
      },
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (data: SettingsForm) => woocommerce.saveSettings(data),
    onSuccess: (data) => {
      setSettings(data);
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your WooCommerce settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message || "An error occurred while saving settings.",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = async () => {
    const values = form.getValues();
    setIsTestingConnection(true);
    
    try {
      const connected = await testConnection({
        storeUrl: values.storeUrl,
        consumerKey: values.consumerKey,
        consumerSecret: values.consumerSecret,
      });

      toast({
        title: connected ? "Connection successful" : "Connection failed",
        description: connected 
          ? "Successfully connected to your WooCommerce store" 
          : "Failed to connect to WooCommerce. Please check your credentials.",
        variant: connected ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Connection test failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const onSubmit = (data: SettingsForm) => {
    saveSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="settings-page-loading">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="settings-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">Configure WooCommerce integration and POS preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="grid w-full grid-rows-5 h-auto">
                  <TabsTrigger value="woocommerce" className="w-full justify-start" data-testid="tab-woocommerce">
                    <Plug size={16} className="mr-2" />
                    WooCommerce API
                  </TabsTrigger>
                  <TabsTrigger value="pos" className="w-full justify-start" data-testid="tab-pos">
                    <ScanBarcode size={16} className="mr-2" />
                    POS Settings
                  </TabsTrigger>
                  <TabsTrigger value="receipt" className="w-full justify-start" data-testid="tab-receipt">
                    <Receipt size={16} className="mr-2" />
                    Receipt Settings
                  </TabsTrigger>
                  <TabsTrigger value="users" className="w-full justify-start" data-testid="tab-users">
                    <Users size={16} className="mr-2" />
                    User Permissions
                  </TabsTrigger>
                  <TabsTrigger value="sync" className="w-full justify-start" data-testid="tab-sync">
                    <FolderSync size={16} className="mr-2" />
                    FolderSync Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* WooCommerce API Settings */}
            <TabsContent value="woocommerce">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Plug size={20} />
                        <span>WooCommerce API Configuration</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure your WooCommerce REST API credentials to sync data
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent' : 'bg-destructive'}`} />
                        <span>{isConnected ? "Connected" : "Disconnected"}</span>
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        data-testid="test-connection-button"
                      >
                        {isTestingConnection ? (
                          <RefreshCw size={16} className="animate-spin mr-2" />
                        ) : (
                          <TestTube size={16} className="mr-2" />
                        )}
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="storeUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store URL *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://yourstore.com"
                                {...field}
                                data-testid="store-url-input"
                              />
                            </FormControl>
                            <FormDescription>
                              Your WooCommerce store URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="consumerKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consumer Key *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConsumerKey ? "text" : "password"}
                                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                  className="font-mono pr-10"
                                  {...field}
                                  data-testid="consumer-key-input"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                  onClick={() => setShowConsumerKey(!showConsumerKey)}
                                >
                                  {showConsumerKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Generated in WooCommerce → Settings → Advanced → REST API
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="consumerSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consumer Secret *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConsumerSecret ? "text" : "password"}
                                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                  className="font-mono pr-10"
                                  {...field}
                                  data-testid="consumer-secret-input"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                  onClick={() => setShowConsumerSecret(!showConsumerSecret)}
                                >
                                  {showConsumerSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Keep this secret secure
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">API Permissions</h4>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="permissions.products"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="permission-products"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Read/Write Products</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="permissions.orders"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="permission-orders"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Create Orders</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="permissions.customers"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="permission-customers"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Read Customers</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="permissions.inventory"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="permission-inventory"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Update Inventory</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="cacheDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cache Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="60"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                                data-testid="cache-duration-input"
                              />
                            </FormControl>
                            <FormDescription>
                              How long to cache WooCommerce data locally
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="autoRefresh"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="auto-refresh-checkbox"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Auto-refresh from WooCommerce</FormLabel>
                              <FormDescription>
                                Automatically refresh data from WooCommerce in the background
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.reset()}
                          data-testid="reset-button"
                        >
                          Reset
                        </Button>
                        <Button
                          type="submit"
                          disabled={saveSettingsMutation.isPending}
                          data-testid="save-settings-button"
                        >
                          {saveSettingsMutation.isPending ? (
                            <RefreshCw size={16} className="animate-spin mr-2" />
                          ) : (
                            <Save size={16} className="mr-2" />
                          )}
                          Save Settings
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs with placeholder content */}
            <TabsContent value="pos">
              <Card>
                <CardHeader>
                  <CardTitle>POS Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">Configure point of sale preferences</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <ScanBarcode size={48} className="mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">POS Configuration</p>
                    <p className="text-sm">POS-specific settings will be available here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receipt">
              <Card>
                <CardHeader>
                  <CardTitle>Receipt Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">Customize receipt layout and information</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt size={48} className="mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Receipt Configuration</p>
                    <p className="text-sm">Receipt customization options will be available here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Permissions</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">User Management</p>
                    <p className="text-sm">User permission settings will be available here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sync">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FolderSync size={20} />
                    <span>Data Synchronization</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Sync data between POS and WooCommerce</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SyncDataSection />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
