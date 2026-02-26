// src/components/feature-card.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Music,
  MapPin,
  Radio,
  Smartphone,
  Timer,
  BookHeart,
  ImagePlay,
  ClipboardCheck,
  Gift,
  MousePointerClick,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Users,
    label: "Custom Nama Tamu",
    desc: "Nama tamu unik di setiap link undangan.",
  },
  {
    icon: Music,
    label: "Backsound",
    desc: "Musik latar otomatis saat undangan dibuka.",
  },
  {
    icon: MapPin,
    label: "Navigasi Lokasi",
    desc: "Integrasi Google Maps ke lokasi venue.",
  },
  {
    icon: Radio,
    label: "Live Streaming",
    desc: "Link streaming untuk tamu yang jauh.",
  },
  {
    icon: Smartphone,
    label: "Integrasi WhatsApp",
    desc: "Kirim undangan via WhatsApp satu klik.",
  },
  {
    icon: Timer,
    label: "Hitung Mundur",
    desc: "Countdown real-time menuju hari H.",
  },
  {
    icon: BookHeart,
    label: "Perjalanan Cinta",
    desc: "Timeline kisah cinta yang elegan.",
  },
  {
    icon: ImagePlay,
    label: "Galeri Foto & Video",
    desc: "Galeri foto dan video interaktif.",
  },
  {
    icon: ClipboardCheck,
    label: "Konfirmasi Kehadiran",
    desc: "Konfirmasi hadir langsung dari undangan.",
  },
  {
    icon: Gift,
    label: "Kirim Hadiah",
    desc: "Info rekening & wishlist di undangan.",
  },
  {
    icon: MousePointerClick,
    label: "Tampilan Interaktif",
    desc: "Animasi hidup dan modern.",
  },
  { icon: Clock, label: "Coming Soon", desc: "Fitur baru segera hadir." },
];

interface FeatureCardProps {
  icon: (typeof features)[0]["icon"];
  label: string;
  desc: string;
  flipped: boolean;
  active: boolean;
  onFlip: () => void;
}

function FeatureCard({
  icon: Icon,
  label,
  desc,
  flipped,
  active,
  onFlip,
}: FeatureCardProps) {
  return (
    <div
      className={`
        cursor-pointer
        h-[100px] md:h-[140px]
        [perspective:800px]
        transition-transform duration-300
        rounded-xl
        ${active ? "scale-[1.04]" : "scale-100"}
      `}
      style={
        active
          ? {
              outline:
                "2px solid color-mix(in oklch, var(--primary) 85%, transparent)",
              outlineOffset: "3px",
              animation: "outline-pulse 1.6s ease-in-out infinite",
            }
          : {
              outline: "2px solid transparent",
              outlineOffset: "3px",
              transition: "outline-color 0.4s ease, transform 0.3s ease",
            }
      }
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`Fitur ${label}`}
      onKeyDown={(e) => e.key === "Enter" && onFlip()}
    >
      <div
        className="
          relative w-full h-full
          [transform-style:preserve-3d]
          transition-transform duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]
        "
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* ════ SISI DEPAN ════ */}
        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            gap-1.5 md:gap-3 p-2 md:p-6
            bg-primary rounded-xl
            [backface-visibility:hidden]
            overflow-hidden
          "
        >
          {/* ── Glass shimmer overlay — subtle saja di atas bg solid ── */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.0) 100%)",
            }}
          />
          {/* ── Stroke border teal terang di atas bg ── */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />

          <Icon
            className="w-5 h-5 md:w-7 md:h-7 text-primary-foreground shrink-0 relative z-10"
            strokeWidth={1.5}
          />
          <span
            className="
              text-[9px] md:text-xs font-semibold
              text-primary-foreground
              text-center leading-tight
              relative z-10
            "
          >
            {label}
          </span>
        </div>

        {/* ════ SISI BELAKANG ════ */}
        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            gap-1 md:gap-2 p-2.5 md:p-5
            bg-primary/80 rounded-xl
            [backface-visibility:hidden]
            [transform:rotateY(180deg)]
            overflow-hidden
          "
        >
          {/* ── Glass shimmer overlay sisi belakang ── */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            }}
          />
          {/* ── Stroke border ── */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />

          <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70 relative z-10">
            {label}
          </span>
          <p className="text-[9px] md:text-xs text-primary-foreground/95 text-center leading-snug relative z-10">
            {desc}
          </p>
          <span className="text-[8px] md:text-[10px] text-primary-foreground/50 mt-0.5 relative z-10">
            tap lagi ↩
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeaturesGrid() {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  useEffect(() => {
    if (activeIdx === null) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % features.length;
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [activeIdx]);

  const handleFlip = (idx: number) => {
    setActiveIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {features.map((feature, idx) => (
        <FeatureCard
          key={idx}
          icon={feature.icon}
          label={feature.label}
          desc={feature.desc}
          flipped={activeIdx === idx}
          active={activeIdx === idx}
          onFlip={() => handleFlip(idx)}
        />
      ))}
    </div>
  );
}
