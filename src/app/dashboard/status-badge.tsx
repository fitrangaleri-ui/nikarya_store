import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type DashboardPaymentStatus =
  | "PAID"
  | "PENDING"
  | "PENDING_MANUAL"
  | "EXPIRED"
  | "FAILED";

type DashboardStatusTone = "success" | "warning" | "danger";
type DashboardStatusSurface = "soft" | "overlay";
type DashboardStatusSize = "sm" | "md";

type DashboardStatusMeta = {
  label: string;
  tone: DashboardStatusTone;
  Icon: typeof CheckCircleIcon;
};

const toneClasses: Record<
  DashboardStatusTone,
  Record<DashboardStatusSurface, string>
> = {
  success: {
    soft: "border-primary/20 bg-primary/10 text-primary",
    overlay:
      "border-white/70 bg-background/90 text-primary shadow-lg shadow-black/10 backdrop-blur-md",
  },
  warning: {
    soft: "border-warning/20 bg-warning/10 text-warning",
    overlay:
      "border-white/70 bg-background/90 text-warning shadow-lg shadow-black/10 backdrop-blur-md",
  },
  danger: {
    soft: "border-destructive/20 bg-destructive/10 text-destructive",
    overlay:
      "border-white/70 bg-background/90 text-destructive shadow-lg shadow-black/10 backdrop-blur-md",
  },
};

const sizeClasses: Record<DashboardStatusSize, string> = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1.5 text-xs",
};

export const dashboardStatusMeta: Record<
  DashboardPaymentStatus,
  DashboardStatusMeta
> = {
  PAID: {
    label: "Lunas",
    tone: "success",
    Icon: CheckCircleIcon,
  },
  PENDING: {
    label: "Menunggu Pembayaran",
    tone: "warning",
    Icon: ClockIcon,
  },
  PENDING_MANUAL: {
    label: "Menunggu Konfirmasi",
    tone: "warning",
    Icon: ClockIcon,
  },
  EXPIRED: {
    label: "Kadaluarsa",
    tone: "danger",
    Icon: XCircleIcon,
  },
  FAILED: {
    label: "Gagal",
    tone: "danger",
    Icon: XCircleIcon,
  },
};

export function getDashboardStatusMeta(status: string) {
  return (
    dashboardStatusMeta[status as DashboardPaymentStatus] ??
    dashboardStatusMeta.FAILED
  );
}

type DashboardStatusBadgeProps = {
  status: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  size?: DashboardStatusSize;
  surface?: DashboardStatusSurface;
  labelOverride?: string;
  showPulseForPaid?: boolean;
};

export function DashboardStatusBadge({
  status,
  className,
  iconClassName,
  labelClassName,
  size = "md",
  surface = "soft",
  labelOverride,
  showPulseForPaid = false,
}: DashboardStatusBadgeProps) {
  const meta = getDashboardStatusMeta(status);
  const isPaid = status === "PAID";

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold shadow-none whitespace-nowrap",
        sizeClasses[size],
        toneClasses[meta.tone][surface],
        className,
      )}
    >
      {showPulseForPaid && isPaid ? (
        <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
      ) : (
        <meta.Icon
          className={cn("h-3.5 w-3.5 shrink-0 stroke-[2.4]", iconClassName)}
        />
      )}
      <span className={cn("leading-none", labelClassName)}>
        {labelOverride ?? meta.label}
      </span>
    </Badge>
  );
}
