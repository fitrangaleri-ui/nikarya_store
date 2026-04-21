import { ReactNode } from "react";
import Link from "next/link";
import { Typography } from "@/components/ui/typography";

interface HeaderBannerProps {
  title: string;
  description: string;
  badgeLabel: string;
  badgeIcon: ReactNode;
  actionIcon?: ReactNode;
  extraBadge?: string | ReactNode;
  badgeHref?: string;
}

export function HeaderBanner({
  title,
  description,
  badgeLabel,
  badgeIcon,
  actionIcon,
  extraBadge,
  badgeHref,
}: HeaderBannerProps) {
  const BadgeWrapper = badgeHref ? Link : "div";

  return (
    <div className="relative rounded-xl overflow-hidden bg-primary px-6 py-10 md:px-10 shadow-xl shadow-primary/10">
      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none blur-[100px] bg-white/20 opacity-50"
      />
      <div
        aria-hidden
        className="absolute top-1/2 -left-20 w-64 h-64 rounded-full pointer-events-none blur-[80px] bg-white/10 opacity-30"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full pointer-events-none blur-[120px] bg-black/20 opacity-40"
      />

      {/* Glass shimmer overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/5"
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Konten */}
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="max-w-xl">
          <BadgeWrapper
            href={badgeHref as any}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white mb-4 hover:bg-white/20 transition-all group"
          >
            {badgeIcon}
            <Typography
              variant="caption"
              className="font-semibold text-white"
            >
              {badgeLabel}
            </Typography>
          </BadgeWrapper>
          <Typography variant="h2" as="h1" className="text-white mb-2">
            {title}
          </Typography>
          <Typography variant="body-base" className="text-white/80 max-w-md">
            {description}
          </Typography>
        </div>

        <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
          {actionIcon && (
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
              {actionIcon}
            </div>
          )}
          {extraBadge && (
            <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm flex items-center gap-1.5">
              {typeof extraBadge === "string" ? (
                <Typography variant="caption" className="font-bold text-white">
                  {extraBadge}
                </Typography>
              ) : (
                extraBadge
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
