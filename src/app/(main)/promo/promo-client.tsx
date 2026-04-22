"use client";

import { useState, useMemo, type ReactNode } from "react";
import {
  TicketIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/scroll-reveal";

interface Promo {
  id: string;
  code: string;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount_cap: number | null;
  min_order_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  scope_type: "all" | "category" | "product";
  is_active: boolean;
}

interface PromoClientProps {
  initialPromos: Promo[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

function PromoSection({
  title,
  count,
  muted = false,
  icon,
}: {
  title: string;
  count: number;
  muted?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-5">
      {icon ? (
        icon
      ) : (
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 ">
          <TicketIcon className="size-6" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <Typography
          variant="h3"
          className={cn("font-bold tracking-tight", muted && "text-muted-foreground")}
        >
          {title}
        </Typography>
        <Badge
          variant={muted ? "secondary" : "default"}
          className="px-3 py-1 text-xs font-bold shadow-none"
        >
          {count}
        </Badge>
      </div>
    </div>
  );
}

function PromoCard({ promo, isExpired }: { promo: Promo; isExpired: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (isExpired) return;
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className={cn(
        "relative h-full flex flex-col justify-between rounded-xl transition-all duration-500 group overflow-hidden glass",
        isExpired
          ? "opacity-60 grayscale-[0.5]"
          : "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/40"
      )}
    >
      {/* Decorative Blob */}
      {!isExpired && (
        <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/20 blur-[60px] pointer-events-none group-hover:bg-primary/30 transition-all duration-700" />
      )}

      <CardContent className="z-10 p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">
          <div className="flex flex-col min-w-0">
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-mono font-black tracking-tighter leading-[0.9]",
                  promo.discount_type === "percentage"
                    ? "text-5xl md:text-6xl lg:text-5xl xl:text-6xl"
                    : "text-3xl sm:text-4xl md:text-3xl lg:text-2xl xl:text-4xl truncate",
                  isExpired
                    ? "text-muted-foreground/60"
                    : "text-foreground group-hover:text-primary transition-colors duration-500"
                )}
              >
                {promo.discount_type === "percentage"
                  ? `${promo.discount_value}%`
                  : fmt(promo.discount_value)}
              </span>
              {promo.discount_type === "percentage" && (
                <Typography
                  variant="caption"
                  color="muted"
                  as="span"
                  className="font-black font-mono uppercase tracking-widest mt-1"
                >
                  Off
                </Typography>
              )}
            </div>
          </div>

          <Badge
            variant={isExpired ? "destructive" : "default"}
            className={cn(
              "shrink-0 px-2.5 py-0.5 text-[10px] md:text-xs h-fit mt-0.5",
              !isExpired && "bg-success text-success-foreground border-transparent",
              isExpired && "shadow-none"
            )}
          >
            {isExpired ? "Expired" : "Active"}
          </Badge>
        </div>

        <div className="space-y-4 mb-10">
          <Typography
            variant="h4"
            className={cn(
              "leading-tight font-bold",
              !isExpired && "group-hover:text-primary transition-colors duration-300"
            )}
          >
            {promo.name}
          </Typography>

          <div className="flex flex-wrap gap-2.5">
            {promo.scope_type !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1.5 h-7 border-border/50"
              >
                <TagIcon className="size-3.5" />
                {promo.scope_type === "category" ? "Kategori" : "Produk"}
              </Badge>
            )}
            <Badge
              variant="default"
              className="gap-1.5 h-7 border-transparent"
            >
              <InformationCircleIcon className="size-3.5" />
              {promo.discount_type === "percentage" && promo.max_discount_cap
                ? `Maks. ${fmt(promo.max_discount_cap)}`
                : promo.discount_type === "fixed"
                  ? "Potongan Tetap"
                  : "No Limit"}
            </Badge>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          {promo.min_order_amount && (
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/90 bg-muted/30 hover:bg-muted/50 transition-colors p-4 rounded-xl border border-border/20">
              <div className="p-2 rounded-xl bg-background  text-primary">
                <ExclamationCircleIcon className="size-4" />
              </div>
              <Typography variant="caption" as="span" className="font-bold">
                Min. belanja {fmt(promo.min_order_amount)}
              </Typography>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/90 bg-muted/30 hover:bg-muted/50 transition-colors p-4 rounded-xl border border-border/20">
            <div className="p-2 rounded-xl bg-background  text-amber-500">
              <ClockIcon className="size-4" />
            </div>
            <Typography variant="caption" as="span" className="font-bold">
              {isExpired ? "Berakhir pada " : "Berlaku hingga "}
              <span className="text-foreground font-black">
                {promo.end_date
                  ? new Date(promo.end_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  : "Seterusnya"}
              </span>
            </Typography>
          </div>
        </div>
      </CardContent>

      <div className="p-6 md:p-8 pt-0 z-10">
        <div
          className={cn(
            "flex items-center justify-between rounded-xl overflow-hidden p-2 border transition-all duration-300",
            isExpired
              ? "bg-muted/50 border-border/50"
              : "bg-primary/5 border-primary/20 hover:border-primary/40 shadow-inner"
          )}
        >
          <div
            className={cn(
              "pl-4 pr-2 py-1 font-mono font-black text-xl md:text-2xl tracking-tighter truncate uppercase",
              isExpired
                ? "text-muted-foreground/30"
                : "text-primary dark:text-primary/90"
            )}
          >
            {promo.code}
          </div>
          <Button
            onClick={handleCopy}
            disabled={isExpired}
            variant={copied ? "default" : "default"}
            size="sm"
            className={cn(
              "shrink-0 rounded-sm uppercase tracking-tight transition-all active:scale-95 font-bold",
              isExpired && "hidden sm:flex",
              copied && "bg-success text-success-foreground hover:bg-success/90"
            )}
          >
            {copied ? (
              <ClipboardDocumentCheckIcon className="size-4 md:size-5" />
            ) : (
              <ClipboardDocumentIcon className="size-4 md:size-5" />
            )}
            {!copied && <span className="ml-2 hidden lg:inline">Copy</span>}
            {copied && <span className="ml-2">Copied</span>}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function PromoClient({ initialPromos }: PromoClientProps) {
  const { active, expired } = useMemo(() => {
    const now = new Date();
    const act: Promo[] = [];
    const exp: Promo[] = [];

    initialPromos.forEach((p) => {
      if (p.end_date) {
        const endDate = new Date(p.end_date);
        if (endDate < now) exp.push(p);
        else act.push(p);
      } else {
        act.push(p);
      }
    });

    act.sort((a, b) => {
      if (!a.end_date) return 1;
      if (!b.end_date) return -1;
      return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    });

    exp.sort((a, b) => {
      if (!a.end_date) return 1;
      if (!b.end_date) return -1;
      return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
    });

    return { active: act, expired: exp };
  }, [initialPromos]);

  if (initialPromos.length === 0) {
    return (
      <ScrollReveal className="w-full max-w-2xl mx-auto">
        <div className="relative flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-border/50 glass py-20 px-10 text-center transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="relative z-10 size-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-inner">
            <TicketIcon
              className="size-10 text-primary/60"
              strokeWidth={1.5}
            />
          </div>

          <div className="relative z-10 max-w-sm">
            <Typography variant="h3" className="mb-4 font-bold tracking-tight">
              Belum Ada Promo
            </Typography>
            <Typography variant="body-base" color="muted" className="leading-relaxed">
              Saat ini tidak ada promo yang tersedia. Cek kembali nanti untuk penawaran spesial dan potongan harga menarik!
            </Typography>
          </div>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <div className="relative w-full space-y-16 animate-in fade-in duration-1000">
      {/* Visual Grid Lines */}
      <div className="absolute inset-x-0 -top-40 -bottom-40 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      {/* Horizontal Accent Lines */}
      <div
        className="absolute inset-x-0 -top-40 -bottom-40 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '100% 80px'
        }}
      />

      {active.length > 0 && (
        <section className="space-y-8">
          <ScrollReveal direction="down">
            <PromoSection title="Promo Berlangsung" count={active.length} />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {active.map((promo, index) => (
              <ScrollReveal key={promo.id} delay={index * 100}>
                <PromoCard promo={promo} isExpired={false} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {expired.length > 0 && (
        <section className="space-y-8 pt-16 border-t border-border/10">
          <ScrollReveal direction="down">
            <PromoSection
              title="Promo Berakhir"
              count={expired.length}
              muted
              icon={
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 border border-border/50">
                  <ClockIcon className="size-5 text-muted-foreground" />
                </div>
              }
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {expired.map((promo, index) => (
              <ScrollReveal key={promo.id} delay={index * 100}>
                <PromoCard promo={promo} isExpired={true} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
