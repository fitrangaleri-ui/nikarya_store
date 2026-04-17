"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TrashIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteProduct, toggleProductStatus, duplicateProduct } from "./actions";

export function DeleteProductButton({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `Hapus produk "${productTitle}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      await deleteProduct(productId);
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-xl text-destructive hover:text-destructive/90 hover:bg-destructive/10 shadow-none transition-colors"
      onClick={handleDelete}
      disabled={isPending}
      title="Hapus Produk"
    >
      <TrashIcon className="h-4 w-4" />
      <span className="sr-only">Hapus Produk</span>
    </Button>
  );
}

export function DuplicateProductButton({
  productId,
}: {
  productId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateProduct(productId);
      if (result?.success && result.newProductId) {
        router.push(`/admin/products/${result.newProductId}/edit`);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 shadow-none transition-colors"
      onClick={handleDuplicate}
      disabled={isPending}
      title="Duplikat Produk"
    >
      <DocumentDuplicateIcon className="h-4 w-4" />
      <span className="sr-only">Duplikat Produk</span>
    </Button>
  );
}

export function ToggleStatusButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      await toggleProductStatus(productId, checked);
    });
  };

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleToggle}
      disabled={isPending}
      className="data-[state=checked]:bg-success transition-colors shadow-sm"
    />
  );
}
