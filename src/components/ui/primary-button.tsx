// ============================================================
// FILE: src/components/ui/primary-button.tsx
// Reusable button dengan style rounded-full + glass shimmer
// ============================================================

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: "primary" | "disabled-outline";
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-9  text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-sm",
};

export function PrimaryButton({
  children,
  loading = false,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  // ── Variant: disabled outline ─────────────────────────────
  if (variant === "disabled-outline") {
    return (
      <button
        disabled
        className={cn(
          "w-full rounded-full bg-muted text-muted-foreground cursor-not-allowed",
          "flex items-center justify-center gap-2 font-semibold border border-border/40",
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }

  // ── Variant: primary ─────────────────────────────────────
  return (
    <button
      disabled={isDisabled}
      className={cn(
        "relative w-full rounded-full overflow-hidden",
        "bg-primary hover:bg-primary/90",
        "text-primary-foreground font-bold",
        "flex items-center justify-center gap-2",
        "transition-all duration-200",
        "hover:scale-[1.01] active:scale-[0.98]",
        "disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {/* Glass shimmer overlay */}
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

      {/* Label + loading state */}
      <span className="relative flex items-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
