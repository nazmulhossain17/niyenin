// components/profile/AddressList.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Trash2, Edit, Check } from "lucide-react";
import AddressFormDialog from "@/components/profile/AddressFormDialog";

type Address = {
  addressId: string;
  label?: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
};

interface AddressListProps {
  addresses: Address[];
  userId: string;
}

export default function AddressList({ addresses, userId }: AddressListProps) {
  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Addresses</CardTitle>
        <Button onClick={() => { setEditingAddress(null); setOpen(true); }} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No addresses saved yet
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.addressId}
                className={`border rounded-lg p-5 relative ${
                  address.isDefault ? "border-primary bg-primary/5" : ""
                }`}
              >
                {address.isDefault && (
                  <Badge className="absolute -top-2 right-4 bg-primary">
                    <Check className="h-3 w-3 mr-1" /> Default
                  </Badge>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {address.label || address.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingAddress(address);
                        setOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm space-y-1 ml-7">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.district}
                    {address.postalCode && ` - ${address.postalCode}`}
                  </p>
                  <p>{address.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AddressFormDialog
        open={open}
        onOpenChange={setOpen}
        address={editingAddress}
        userId={userId}
      />
    </Card>
  );
}