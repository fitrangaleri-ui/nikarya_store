// src/components/feature-card.tsx
"use client";

import { useState } from "react";
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
  onFlip: () => void;
}

function FeatureCard({
  icon: Icon,
  label,
  desc,
  flipped,
  onFlip,
}: FeatureCardProps) {
  return (
    // ── PERUBAHAN UTAMA: h-[100px] fixed di mobile, h-[140px] di desktop ──
    // Tinggi fixed mencegah card mengembang saat flip & menjaga grid konsisten
    <div
      className="
        cursor-pointer
        h-[100px] md:h-[140px]
        [perspective:800px]
      "
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`Fitur ${label}`}
      onKeyDown={(e) => e.key === "Enter" && onFlip()}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* ── Sisi Depan ── */}
        <div
          className="
          absolute inset-0
          flex flex-col items-center justify-center
          gap-1.5 md:gap-3
          p-2 md:p-6
          bg-primary rounded-xl md:rounded-xl
          [backface-visibility:hidden]
          hover:bg-primary/90
          transition-colors duration-200
        "
        >
          <Icon
            className="w-5 h-5 md:w-7 md:h-7 text-primary-foreground/80 shrink-0"
            strokeWidth={1.5}
          />
          <span
            className="
            text-[9px] md:text-xs font-medium
            text-primary-foreground/90
            text-center leading-tight
          "
          >
            {label}
          </span>
        </div>

        {/* ── Sisi Belakang ── */}
        <div
          className="
          absolute inset-0
          flex flex-col items-center justify-center
          gap-1 md:gap-2
          p-2.5 md:p-5
          bg-primary/85 rounded-xl md:rounded-xl
          [backface-visibility:hidden]
          [transform:rotateY(180deg)]
          border border-primary-foreground/10
          overflow-hidden
        "
        >
          {/* Label judul — hanya desktop, hemat ruang di mobile */}
          <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50">
            {label}
          </span>
          {/* Deskripsi — diperpendek untuk mobile */}
          <p
            className="
            text-[9px] md:text-xs
            text-primary-foreground/90
            text-center leading-snug
          "
          >
            {desc}
          </p>
          <span className="text-[8px] md:text-[10px] text-primary-foreground/40">
            tap lagi ↩
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeaturesGrid() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

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
          onFlip={() => handleFlip(idx)}
        />
      ))}
    </div>
  );
}
