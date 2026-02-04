// File: app/user/profile/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Plus,
  Shield,
  Package,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { UserAddress, getAddresses } from "@/lib/api/user";
import { toast } from "sonner";
import { AddressCard } from "@/components/profile/AddressCard";
import { AddressFormDialog } from "@/components/profile/AddressFormDialog";

// Extended user type with additional fields
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  phone?: string | null;
  phoneVerified?: boolean;
  role?: string;
  isActive?: boolean;
  isBanned?: boolean;
  banReason?: string | null;
  lastLoginAt?: Date | null;
  lastLoginIp?: string | null;
}

export default function ProfilePage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      redirect("/login");
    }
  }, [session, isSessionLoading]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const response = await getAddresses();
      if (response.success) {
        setAddresses(response.data);
      } else {
        toast.error("Failed to load addresses");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
    }
  }, [session, fetchAddresses]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressDialogOpen(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  };

  const user = session?.user as ExtendedUser | undefined;

  // Loading state
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid lg:grid-cols-4 gap-6">
              <Skeleton className="h-64 lg:col-span-1" />
              <Skeleton className="h-96 lg:col-span-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = user.isActive !== false; // Default to true if undefined

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Account</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.image || ""} alt={user.name} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  <h2 className="mt-4 font-semibold text-lg">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>

                  <div className="flex items-center gap-1 mt-2">
                    {user.emailVerified ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-yellow-600">
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Wishlist</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Links - Mobile */}
                <nav className="space-y-1 lg:hidden">
                  <Button
                    variant={activeTab === "profile" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant={activeTab === "addresses" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("addresses")}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Addresses
                  </Button>
                  <Button
                    variant={activeTab === "orders" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("orders")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                  <Button
                    variant={activeTab === "security" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Desktop Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="hidden lg:grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="addresses" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Addresses
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2">
                  <Package className="h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          defaultValue={user.name}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            defaultValue={user.email}
                            disabled
                            className="pr-10"
                          />
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            defaultValue={user.phone ?? ""}
                            placeholder="+880 1XXX-XXXXXX"
                            className="pr-10"
                          />
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Account Status</Label>
                        <div className="flex items-center gap-2 h-10">
                          <Badge
                            variant={isActive ? "default" : "destructive"}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                          {user.emailVerified && (
                            <Badge variant="secondary">Email Verified</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Delivery Addresses</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your delivery addresses
                    </p>
                  </div>
                  <Button onClick={handleAddAddress} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Address
                  </Button>
                </div>

                {isLoadingAddresses ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg">No addresses yet</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                        Add a delivery address to make checkout faster
                      </p>
                      <Button onClick={handleAddAddress} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Address
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.addressId}
                        address={address}
                        onEdit={handleEditAddress}
                        onRefresh={fetchAddresses}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View and track your orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No orders yet</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                      When you place orders, they will appear here
                    </p>
                    <Button variant="outline">Start Shopping</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button>Update Password</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">2FA is disabled</p>
                          <p className="text-sm text-muted-foreground">
                            Protect your account with 2FA
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible account actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        address={editingAddress}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}