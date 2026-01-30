// File: components/admin/brands/brand-form-dialog.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Brand, BrandFormData } from "@/types";
import { createBrand, updateBrand, generateSlug } from "@/lib/api/brands";
import { toast } from "sonner";

interface FormValues {
  name: string;
  slug: string;
  description: string;
  logo: string;
  website: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
  onSuccess: () => void;
}

export function BrandFormDialog({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: BrandFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!brand;

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo: "",
      website: "",
      sortOrder: 0,
      isActive: true,
      isFeatured: false,
    },
  });

  // Reset form when brand changes
  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        logo: brand.logo || "",
        website: brand.website || "",
        sortOrder: brand.sortOrder,
        isActive: brand.isActive,
        isFeatured: brand.isFeatured,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        logo: "",
        website: "",
        sortOrder: 0,
        isActive: true,
        isFeatured: false,
      });
    }
  }, [brand, form]);

  // Auto-generate slug from name
  const watchName = form.watch("name");
  useEffect(() => {
    if (!isEditing && watchName) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, isEditing, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const data: BrandFormData = {
        ...values,
        logo: values.logo || undefined,
        website: values.website || undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      const response = isEditing
        ? await updateBrand(brand!.brandId, data)
        : await createBrand(data);

      if (response.success) {
        toast.success(
          isEditing ? "Brand updated successfully" : "Brand created successfully"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Brand" : "Add New Brand"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the brand details below."
              : "Fill in the details to create a new brand."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                rules={{ required: "Slug is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="brand-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brand description..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="w-32"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-8">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Active</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Featured</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}