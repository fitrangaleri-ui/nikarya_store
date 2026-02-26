// src/components/faq-section.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";

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
        group rounded-2xl overflow-hidden
        transition-all duration-300
        ${
          isOpen
            ? "bg-primary shadow-lg shadow-primary/20"
            : "bg-card border border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
        }
      `}
    >
      {/* ── Trigger ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        {/* Nomor + Pertanyaan */}
        <span
          className={`
            text-sm font-semibold leading-snug transition-colors duration-200
            ${isOpen ? "text-primary-foreground" : "text-foreground group-hover:text-primary"}
          `}
        >
          {question}
        </span>

        {/* Icon Plus/Minus */}
        <span
          className={`
            shrink-0 w-7 h-7 rounded-full flex items-center justify-center
            transition-all duration-300
            ${
              isOpen
                ? "bg-primary-foreground/15 text-primary-foreground rotate-0"
                : "bg-primary/8 text-primary border border-primary/20"
            }
          `}
        >
          {isOpen ? (
            <Minus className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
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
          <p
            className={`
              px-5 py-4 text-sm leading-relaxed transition-colors duration-300
              ${isOpen ? "text-primary-foreground/80" : "text-muted-foreground"}
            `}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── FAQ Section ────────────────────────────────────────────────
export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  const leftFaqs = faqs.filter((_, i) => i % 2 === 0);
  const rightFaqs = faqs.filter((_, i) => i % 2 !== 0);

  return (
    <section className="w-full bg-background py-16 md:py-24 relative overflow-hidden">
      {/* ── Ambient glow ── */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 md:px-0 relative z-10">
        {/* ── Header ── */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Pertanyaan Umum
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Ada yang ingin ditanyakan?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Temukan jawaban atas pertanyaan umum seputar layanan kami di sini.
          </p>
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
