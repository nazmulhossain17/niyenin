// File: components/user/address-card.tsx

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Phone,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  Home,
  Building2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { UserAddress, setDefaultAddress, deleteAddress } from "@/lib/api/user";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddressCardProps {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
  onRefresh: () => void;
}

const labelIcons: Record<string, React.ReactNode> = {
  Home: <Home className="h-4 w-4" />,
  Office: <Building2 className="h-4 w-4" />,
  Business: <Briefcase className="h-4 w-4" />,
};

export function AddressCard({ address, onEdit, onRefresh }: AddressCardProps) {
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSetDefault = async () => {
    if (address.isDefault) return;
    
    setIsSettingDefault(true);
    try {
      const response = await setDefaultAddress(address.addressId);
      if (response.success) {
        toast.success("Default address updated");
        onRefresh();
      } else {
        toast.error(response.error || "Failed to update");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteAddress(address.addressId);
      if (response.success) {
        toast.success("Address deleted");
        onRefresh();
      } else {
        toast.error(response.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={cn(
        "relative transition-all hover:shadow-md",
        address.isDefault && "ring-2 ring-primary"
      )}
    >
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {address.label && (
              <Badge variant="secondary" className="gap-1">
                {labelIcons[address.label] || <MapPin className="h-3 w-3" />}
                {address.label}
              </Badge>
            )}
            {address.isDefault && (
              <Badge variant="default" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Default
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(address)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {!address.isDefault && (
                <DropdownMenuItem onClick={handleSetDefault} disabled={isSettingDefault}>
                  {isSettingDefault ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="mr-2 h-4 w-4" />
                  )}
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="font-medium">{address.fullName}</span>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <span>{address.phone}</span>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p>{address.addressLine1}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>
                {address.city}, {address.district}
                {address.postalCode && ` - ${address.postalCode}`}
              </p>
              <p>{address.country}</p>
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="mt-4 pt-4 border-t flex gap-2 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(address)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleSetDefault}
              disabled={isSettingDefault}
            >
              {isSettingDefault ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Star className="mr-2 h-4 w-4" />
              )}
              Set Default
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}