import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva(
  "text-foreground",
  {
    variants: {
      variant: {
        h1: "font-sans text-[length:var(--text-h1)] leading-[calc(var(--text-h1-lh))] font-black tracking-tight",
        h2: "font-sans text-[length:var(--text-h2)] leading-[calc(var(--text-h2-lh))] font-extrabold tracking-tight",
        h3: "font-sans text-[length:var(--text-h3)] leading-[calc(var(--text-h3-lh))] font-bold tracking-tight",
        h4: "font-sans text-[length:var(--text-h4)] leading-[calc(var(--text-h4-lh))] font-semibold tracking-tight",
        h5: "font-sans text-[length:var(--text-h5)] leading-[calc(var(--text-h5-lh))] font-semibold tracking-tight",
        h6: "font-sans text-[length:var(--text-h6)] leading-[calc(var(--text-h6-lh))] font-semibold tracking-tight",
        "body-lg": "font-sans text-[length:var(--text-body-lg)] leading-[calc(var(--text-body-lg-lh))]",
        "body-base": "font-sans text-[length:var(--text-body-base)] leading-[calc(var(--text-body-base-lh))]",
        "body-sm": "font-sans text-[length:var(--text-body-sm)] leading-[calc(var(--text-body-sm-lh))]",
        caption: "font-sans text-[length:var(--text-caption)] leading-[calc(var(--text-caption-lh))]",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      color: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        accent: "text-accent-foreground",
        destructive: "text-destructive",
        success: "text-success",
        warning: "text-warning",
        rating: "text-rating",
        sale: "text-sale",
      },
    },
    defaultVariants: {
      variant: "body-base",
      align: "left",
      color: "default",
    },
  }
);

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
  VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, color, as, ...props }, ref) => {
    const defaultTag = variant && variant.startsWith("h") && variant.length === 2 ? variant as React.ElementType : "p";
    const Comp = as || defaultTag;

    return (
      <Comp
        className={cn(typographyVariants({ variant, align, color }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Typography.displayName = "Typography";

export { Typography, typographyVariants };
