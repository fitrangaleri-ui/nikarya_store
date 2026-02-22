"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct, toggleProductStatus } from "./actions";
import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";

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
      className="h-9 w-9 rounded-none text-destructive hover:text-destructive/80 hover:bg-destructive/10 shadow-none transition-colors"
      onClick={handleDelete}
      disabled={isPending}
      title="Hapus Produk"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Hapus Produk</span>
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
      className="data-[state=checked]:bg-green-600"
    />
  );
}
