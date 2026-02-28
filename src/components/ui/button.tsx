// ============================================================
// FILE: src/components/ui/button.tsx
// PERUBAHAN: Hapus rounded-md dari size sm & icon-xs
//            → semua size kini rounded-full dari base CVA
// ============================================================

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-sans font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-sm",
        outline:
          "border border-input bg-white text-primary shadow-xs hover:bg-background dark:bg-accent dark:border-input dark:hover:bg-input/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        brand: [
          "relative overflow-hidden",
          "bg-primary hover:bg-primary/90",
          "text-primary-foreground font-bold",
          "shadow-md hover:shadow-lg",
          "active:scale-[0.98]",
        ].join(" "),

        "brand-pill": [
          "relative overflow-hidden",
          "bg-primary hover:bg-primary/90",
          "text-primary-foreground font-bold",
          "rounded-full",
          "pl-6 pr-1.5",
          "gap-4",
          "justify-between",
          "shadow-md hover:shadow-lg",
          "active:scale-[0.98]",
          "[&_.brand-pill__icon]:flex",
          "[&_.brand-pill__icon]:items-center",
          "[&_.brand-pill__icon]:justify-center",
          "[&_.brand-pill__icon]:w-8",
          "[&_.brand-pill__icon]:h-8",
          "[&_.brand-pill__icon]:rounded-full",
          "[&_.brand-pill__icon]:bg-white/20",
          "[&_.brand-pill__icon]:text-white",
          "[&_.brand-pill__icon]:flex-shrink-0",
          "[&_.brand-pill__icon]:transition-colors",
          "hover:[&_.brand-pill__icon]:bg-white/30",
        ].join(" "),
      },

      size: {
        // rounded-md DIHAPUS dari sm & icon-xs — ikut rounded-full base
        xs: "h-8 gap-1 px-2.5 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 gap-1.5 px-4 has-[>svg]:px-3",
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        lg: "h-12 px-8 has-[>svg]:px-5 text-base",
        pill: "h-14 py-2 text-sm",
        icon: "size-11",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const SHIMMER_VARIANTS = new Set(["brand", "brand-pill"]);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  const needsShimmer = SHIMMER_VARIANTS.has(variant as string) && !asChild;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {needsShimmer && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />
        </>
      )}

      {needsShimmer ? (
        <span className="relative flex items-center gap-2">{children}</span>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
