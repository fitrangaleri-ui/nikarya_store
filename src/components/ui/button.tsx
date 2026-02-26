import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-[family-name:var(--font-quicksand)] font-medium uppercase tracking-[-0.005em] transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-sm",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        brand:
          "bg-teal-700 text-white hover:bg-teal-800 shadow-md hover:shadow-lg active:scale-95",

        // ── Variant brand-pill ────────────────────────────────────────
        // Pill CTA dengan icon circle semi-transparan di kanan
        // Penggunaan:
        //   <Button variant="brand-pill" size="lg" className="w-fit min-w-40 group">
        //     Label
        //     <span className="brand-pill__icon">
        //       <ArrowRight />
        //     </span>
        //   </Button>
        "brand-pill": [
          "bg-teal-700 text-white",
          "hover:bg-teal-800",
          "rounded-full", // pill shape — tidak boleh di-override size
          "pl-6 pr-1.5", // padding asimetris: teks lega kiri, icon flush kanan
          "gap-4", // jarak teks ke icon circle
          "justify-between",
          "shadow-md hover:shadow-lg",
          "active:scale-[0.98]",
          // ── Target wrapper icon circle via class brand-pill__icon ──
          "[&_.brand-pill__icon]:flex",
          "[&_.brand-pill__icon]:items-center",
          "[&_.brand-pill__icon]:justify-center",
          "[&_.brand-pill__icon]:w-8", // 32px — proporsional dengan h-12
          "[&_.brand-pill__icon]:h-8", // 32px
          "[&_.brand-pill__icon]:rounded-full",
          "[&_.brand-pill__icon]:bg-white/20", // circle semi-transparan
          "[&_.brand-pill__icon]:text-white",
          "[&_.brand-pill__icon]:flex-shrink-0",
          "[&_.brand-pill__icon]:transition-colors",
          "hover:[&_.brand-pill__icon]:bg-white/30",
        ].join(" "),
        // ── End Variant brand-pill ────────────────────────────────────
      },

      size: {
        // ─────────────────────────────────────────────────────────────
        // Skala tinggi — proporsional dari xs hingga pill
        // PENTING: size tidak mendefinisikan rounded agar tidak
        //          meng-override rounded dari variant (kasus brand-pill)
        // ─────────────────────────────────────────────────────────────

        // xs: 32px — micro, label/badge action
        xs: "h-8 gap-1 px-2.5 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",

        // sm: 40px — compact, tabel/inline action
        // rounded-md dipertahankan karena sm jarang dipakai dengan rounded-full
        sm: "h-10 rounded-md gap-1.5 px-4 has-[>svg]:px-3",

        // default: 44px — standar mayoritas UI
        default: "h-11 px-5 py-2 has-[>svg]:px-4",

        // lg: 48px — CTA utama, dipakai bersama brand-pill
        // rounded-md DIHAPUS agar tidak override rounded-full dari brand-pill
        lg: "h-12 px-8 has-[>svg]:px-5 text-base",

        // pill: 56px — reserved, tersedia jika dibutuhkan ukuran lebih besar
        pill: "h-14 py-2 text-sm",

        // ── Icon sizes ────────────────────────────────────────────────
        icon: "size-11", // 44px — default
        "icon-xs": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-3", // 32px
        "icon-sm": "size-10", // 40px
        "icon-lg": "size-12", // 48px
        // ─────────────────────────────────────────────────────────────
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
