// src/components/faq-section.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";

const keywords = ["WeddingPress", "Elementor", "JSON", "WordPress", "HTML", "SVG", "CSS", "WEBP", "PRO"];

const boldKeywords = (text: string) => {
  if (!text) return text;
  const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
  return text.split(regex).map((part, i) =>
    keywords.some((k) => k.toLowerCase() === part.toLowerCase()) ? (
      <b key={i} className="font-bold">{part}</b>
    ) : (
      part
    )
  );
};

const faqs = [
  {
    q: "Apakahiad itu Nikarya Digital?",
    a: "Nikarya Digital adalah sebuah platform yang menyediakan berbagai macam template undangan digital premium dalam format JSON. Template dari Nikarya Digital dirancang khusus untuk mempermudah penyedia jasa pembuatan undangan digital agar bisa bekerja lebih cepat dan efisien.",
  },
  {
    q: "Apakah saya perlu hosting dan domain sendiri?",
    a: "Ya, Nikarya Digital adalah Template WordPress. Anda harus memiliki hosting dan domain sendiri untuk menginstal WordPress dan Template kami.",
  },
  {
    q: "Apakah saya akan mendapatkan dukungan teknis?",
    a: "Ya, kami menyediakan dukungan teknis melalui Whatsapp atau Telegram. Tim kami siap membantu jika Anda mengalami kendala saat menggunakan Template kami.",
  },
  {
    q: "Apakah saya bisa menjual kembali tema yang sudah saya edit?",
    a: "Anda tidak diizinkan untuk menjual kembali file JSON template kami. Anda hanya bisa menggunakan tema ini untuk layanan jasa pembuatan undangan digital.",
  },
  {
    q: "Plugin apakah yang dibutuhkan untuk menggunakan template ini?",
    a: "Plugin ini memerlukan beberapa plugin tambahan untuk bisa menggunakan tema template yaitu Elementor Pro dan WeddingPress agar bisa berfungsi sepenuhnya. Mohon pastikan kedua plugin tersebut sudah terpasang dan aktif di website Anda.",
  },
  {
    q: "Apakah ada garansi uang kembali?",
    a: "Kami tidak menawarkan garansi uang kembali karena produk kami adalah produk digital. Kami menyarankan Anda untuk melihat demo produk kami terlebih dahulu sebelum membeli.",
  },
  {
    q: "Berapa Harga Minimum Penjualan?",
    a: "Tidak ada batasan harga jual yang ditetapkan secara resmi. Namun, kami menyarankan harga minimum penjualan sebesar Rp100.000-Rp200.000 per tema kepada end-user, agar tetap menjaga nilai produk dan ekosistem penjual.",
  },
  {
    q: "Bagaimana cara instalasi template Nikarya Digital?",
    a: "Instalasi template sama seperti instalasi template WordPress pada umumnya. Setelah mengunduh file, Anda bisa mengunggahnya melalui dashboard WordPress, Panduan detail juga tersedia di website kami.",
  },
];

// ── Accordion Item ─────────────────────────────────────────────
interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Ukur scrollHeight setiap kali isOpen berubah
  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`
        group rounded-lg overflow-hidden
        transition-all duration-300
        ${isOpen
          ? "bg-primary"
          : "bg-card border border-border hover:border-primary/30"
        }
      `}
    >
      {/* ── Trigger ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        {/* Nomor + Pertanyaan */}
        <Typography
          variant="body-sm"
          as="span"
          className={`
            font-medium leading-snug transition-colors duration-200
            ${isOpen ? "!text-primary-foreground" : "text-foreground group-hover:text-primary"}
          `}
        >
          {boldKeywords(question)}
        </Typography>

        {/* Icon Plus/Minus */}
        <span
          className={`
            shrink-0 w-7 h-7 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isOpen
              ? "bg-primary-foreground/15 text-primary-foreground rotate-0"
              : "bg-primary/8 text-primary border border-primary/20"
            }
          `}
        >
          {isOpen ? (
            <MinusIcon className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
          )}
        </span>
      </button>

      {/* ── Jawaban — smooth expand dengan scrollHeight ── */}
      <div
        style={{
          height: `${height}px`,
          transition: "height 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div ref={contentRef}>
          {/* Divider tipis */}
          <div
            className={`
              mx-5 border-t transition-colors duration-300
              ${isOpen ? "border-primary-foreground/15" : "border-border"}
            `}
          />
          <Typography
            variant="body-sm"
            as="p"
            className={`
              px-5 py-4 leading-relaxed transition-colors duration-300
              ${isOpen ? "!text-primary-foreground/80" : "text-muted-foreground"}
            `}
          >
            {boldKeywords(answer)}
          </Typography>
        </div>
      </div>
    </div>
  );
}

// ── FAQ Section ────────────────────────────────────────────────
interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  customFaqs?: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function FaqSection({
  customFaqs,
  title = "Ada yang ingin ditanyakan?",
  subtitle = "Temukan jawaban atas pertanyaan umum seputar layanan kami di sini."
}: FaqSectionProps) {
  const displayFaqs = customFaqs || faqs;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const handleToggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  const leftFaqs = displayFaqs.filter((_, i) => i % 2 === 0);
  const rightFaqs = displayFaqs.filter((_, i) => i % 2 !== 0);

  return (
    <section className="w-full bg-background pt-16 pb-0 md:pt-24 md:pb-0 relative overflow-hidden">


      <div className="mx-auto max-w-6xl px-4 md:px-0 relative z-10">
        {/* ── Header ── */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6">
          </div>
          <Typography variant="h2" className="text-center">
            {title}
          </Typography>
          <Typography variant="body-base" className="text-sm mt-2 text-center md:text-base text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </Typography>
        </div>

        {/* ── Grid 2 kolom ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          {/* Kolom Kiri */}
          <div className="flex flex-col gap-3">
            {leftFaqs.map((faq, i) => {
              const globalIdx = i * 2;
              return (
                <AccordionItem
                  key={globalIdx}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openIdx === globalIdx}
                  onToggle={() => handleToggle(globalIdx)}
                />
              );
            })}
          </div>

          {/* Kolom Kanan */}
          <div className="flex flex-col gap-3">
            {rightFaqs.map((faq, i) => {
              const globalIdx = i * 2 + 1;
              return (
                <AccordionItem
                  key={globalIdx}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openIdx === globalIdx}
                  onToggle={() => handleToggle(globalIdx)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
