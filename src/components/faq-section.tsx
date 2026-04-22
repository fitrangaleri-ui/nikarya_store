// src/components/faq-section.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "Berapa lama proses pengerjaan undangan web?",
    a: "Untuk estimasi proses pengerjaan maksimal 2 hari setelah semua data kami terima, tidak menutup kemungkinan bisa lebih cepat.",
  },
  {
    q: "Apakah bisa hapus ucapan yang ditulis oleh tamu undangan?",
    a: "Bisa, nanti kakak bisa informasikan detail ucapan mana yang mau dihapus.",
  },
  {
    q: "Apakah bisa revisi?",
    a: "Bisa, kami menyediakan revisi untuk memastikan undangan sesuai dengan keinginan kakak.",
  },
  {
    q: "Apakah bisa undangan tidak menggunakan foto?",
    a: "Bisa, undangan tetap bisa dibuat tanpa foto sesuai permintaan kakak.",
  },
  {
    q: "Berapa lama proses revisi selesai?",
    a: "Proses revisi biasanya selesai dalam 1×24 jam setelah permintaan revisi diterima.",
  },
  {
    q: "Apakah bisa merubah atau custom desain?",
    a: "Untuk custom desain bisa didiskusikan terlebih dahulu dengan tim kami, tergantung tingkat perubahan yang diinginkan.",
  },
  {
    q: "Apakah jika mengurangi fitur mengurangi harga?",
    a: "Untuk pengurangan fitur tidak serta merta mengurangi harga, silakan konsultasikan dulu dengan admin kami.",
  },
  {
    q: "Jika acaranya mundur apakah bisa dirubah?",
    a: "Bisa, perubahan tanggal acara bisa diajukan ke admin dan akan diproses secepatnya.",
  },
  {
    q: "Apakah bisa request lagu untuk backsound?",
    a: "Bisa, kakak bisa request lagu favorit untuk dijadikan backsound undangan.",
  },
  {
    q: "Apa itu fitur RSVP?",
    a: "RSVP adalah fitur konfirmasi kehadiran tamu secara digital langsung dari undangan, sehingga kakak bisa memantau siapa saja yang hadir.",
  },
  {
    q: "Nama tamu di undangan siapa yang isikan?",
    a: "Nama tamu diisikan oleh kakak saat mengirimkan link undangan. Kami akan menyediakan panduan penggunaannya.",
  },
  {
    q: "Perbedaan paket basic dan premium apa yah ka?",
    a: "Perbedaan utamanya ada pada jumlah fitur yang tersedia. Paket premium mencakup lebih banyak fitur seperti galeri foto, RSVP, dan live streaming. Silakan cek halaman paket untuk detail lengkapnya.",
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
          {question}
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
            {answer}
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
            <Badge
              variant="outline"
              className="bg-primary/8 border-primary/15 text-primary px-4 py-1.5 rounded-full hover:bg-primary/12 transition-colors duration-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-2" />
              Pertanyaan Umum
            </Badge>
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
