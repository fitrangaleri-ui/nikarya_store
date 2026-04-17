"use client";

import { useState, useMemo, type ReactNode } from "react";
import {
  Ticket,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Info,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center gap-4">
      {icon ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
          {icon}
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
          <Ticket className="w-5 h-5" />
        </div>
      )}
      <div className="flex items-center gap-3">
        <h2
          className={cn(
            "text-2xl md:text-4xl font-instrument-serif font-bold tracking-tight",
            muted ? "text-foreground/60" : "text-foreground",
          )}
        >
          {title}
        </h2>
        <Badge
          variant={muted ? "secondary" : "default"}
          className="px-2 shadow-none"
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
        "relative h-full flex flex-col justify-between rounded-xl border transition-all duration-500 group overflow-hidden",
        isExpired
          ? "bg-muted/20 border-border/40 opacity-60 grayscale-[0.5] backdrop-blur-xl"
          : "bg-background/95 backdrop-blur-2xl border-border/50 shadow-2xl shadow-black/5 hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:border-primary/30",
      )}
    >
      {/* Decorative Blob */}
      {!isExpired && (
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-[60px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
      )}

      <CardContent className="z-10 p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-5xl md:text-6xl font-mono font-bold tracking-tighter leading-none",
                  isExpired
                    ? "text-muted-foreground/60"
                    : "text-foreground group-hover:text-primary transition-colors duration-500",
                )}
              >
                {promo.discount_type === "percentage"
                  ? `${promo.discount_value}%`
                  : fmt(promo.discount_value)}
              </span>
              {promo.discount_type === "percentage" && (
                <span className="text-sm font-black font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Off
                </span>
              )}
            </div>
          </div>

          <Badge
            variant={isExpired ? "secondary" : "outline"}
            className={cn(
              "shrink-0",
              !isExpired && "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
            )}
          >
            {isExpired ? "Expired" : "Active"}
          </Badge>
        </div>

        <div className="space-y-4 mb-8">
          <h3
            className={cn(
              "text-2xl md:text-3xl font-instrument-serif font-bold leading-tight text-foreground line-clamp-2",
              !isExpired &&
              "group-hover:text-primary transition-colors duration-300",
            )}
          >
            {promo.name}
          </h3>

          <div className="flex flex-wrap gap-2">
            {promo.scope_type !== "all" && (
              <Badge
                variant="outline"
                className="gap-1.5 bg-muted/30 text-muted-foreground"
              >
                <Tag className="w-3 h-3" />
                {promo.scope_type === "category" ? "Kategori" : "Produk"}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="gap-1.5 bg-muted/30 text-muted-foreground"
            >
              <Info className="w-3 h-3" />
              {promo.discount_type === "percentage" && promo.max_discount_cap
                ? `Maks. ${fmt(promo.max_discount_cap)}`
                : promo.discount_type === "fixed"
                  ? "Potongan Tetap"
                  : "No Limit"}
            </Badge>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          {promo.min_order_amount && (
            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/80 bg-muted/20 hover:bg-muted/40 transition-colors p-3 rounded-2xl border border-border/20">
              <div className="p-1.5 rounded-lg bg-background shadow-sm text-primary/70">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <span>Min. belanja {fmt(promo.min_order_amount)}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/80 bg-muted/20 hover:bg-muted/40 transition-colors p-3 rounded-2xl border border-border/20">
            <div className="p-1.5 rounded-lg bg-background shadow-sm text-orange-500/70">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>
              {isExpired ? "Berakhir pada " : "Berlaku hingga "}
              <span className="text-foreground/80 font-black">
                {promo.end_date
                  ? new Date(promo.end_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  : "Seterusnya"}
              </span>
            </span>
          </div>
        </div>
      </CardContent>

      <div className="p-6 md:p-8 pt-0 z-10">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl overflow-hidden p-2 border transition-all duration-300",
            isExpired
              ? "bg-muted/40 border-border/40"
              : "bg-primary/5 border-primary/20 hover:border-primary/40 shadow-inner",
          )}
        >
          <div
            className={cn(
              "pl-4 pr-3 py-1 font-mono font-black text-xl md:text-2xl tracking-tighter truncate uppercase",
              isExpired
                ? "text-muted-foreground/40"
                : "text-primary dark:text-primary/90",
            )}
          >
            {promo.code}
          </div>
          <Button
            onClick={handleCopy}
            disabled={isExpired}
            className={cn(
              "h-11 shrink-0 rounded-lg px-6 font-normal text-sm uppercase tracking-tigh shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all active:scale-95",
              isExpired
                ? "bg-muted/50 text-muted-foreground/40 hidden sm:flex"
                : copied
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
            )}
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" strokeWidth={3} />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? "Copied" : "Copy"}
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
      <Card className="relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center rounded-[2.5rem] border border-border/50 bg-background/95 backdrop-blur-2xl py-24 text-center shadow-2xl shadow-black/5 animate-in fade-in zoom-in-95 duration-700 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="relative z-10 w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
          <Ticket
            className="w-12 h-12 text-primary shadow-sm"
            strokeWidth={1.5}
          />
        </div>

        <div className="relative z-10 max-w-md px-6">
          <h2 className="text-4xl font-instrument-serif font-bold text-foreground tracking-tight mb-4">
            Belum Ada Promo
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-medium">
            Saat ini tidak ada promo yang tersedia.{" "}
            <br className="hidden sm:block" />
            Cek kembali nanti untuk penawaran spesial dan potongan harga
            menarik!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      <div className="relative rounded-xl overflow-hidden bg-primary px-8 py-16 md:px-20 md:py-24 shadow-2xl shadow-primary/20 border border-primary/10">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-[120px] rounded-full animate-blob pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 blur-[120px] rounded-full animate-blob animation-delay-2000 pointer-events-none" />

        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"
        />

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-instrument-serif font-bold text-white leading-[1.05] tracking-tight mb-8">
            Dapatkan Penawaran <br />
            <span className="text-white/60">Terbaik Untukmu.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium max-w-xl">
            Salin kode promo di bawah ini dan gunakan saat checkout untuk
            menikmati potongan harga eksklusif di order kamu hari ini.
          </p>
        </div>
      </div>

      {active.length > 0 && (
        <section className="space-y-6">
          <PromoSection title="Promo Berlangsung" count={active.length} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {active.map((promo) => (
              <PromoCard key={promo.id} promo={promo} isExpired={false} />
            ))}
          </div>
        </section>
      )}

      {expired.length > 0 && (
        <section className="space-y-6 pt-10 mt-10 border-t border-border/40">
          <PromoSection
            title="Promo Berakhir"
            count={expired.length}
            muted
            icon={
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {expired.map((promo) => (
              <PromoCard key={promo.id} promo={promo} isExpired={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
