"use client";

import { useRef, useEffect, useState } from "react";
import { PlusIcon, MinusIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";

const warningItems = [
  {
    q: "Wajib Paham Dasar WordPress & Elementor",
    a: "Pastikan Anda sudah memahami cara kerja WordPress dan Elementor, minimal cara membuat halaman baru, mengedit dengan Elementor, serta mengimpor template.",
  },
  {
    q: "Sudah Menginstal Plugin Elementor Pro & WeddingPress",
    a: "Template ini memerlukan Elementor Pro dan plugin WeddingPress untuk berfungsi sepenuhnya. Mohon pastikan kedua plugin tersebut sudah terpasang dan aktif di website Anda.",
  },
  {
    q: "Menggunakan Tema WordPress yang Ringan & Compatible",
    a: "Disarankan menggunakan tema WordPress Hello Elementor untuk performa maksimal dan kompatibilitas yang optimal.",
  },
  {
    q: "Versi Plugin Sesuai Rekomendasi",
    a: "Gunakan versi Elementor Pro dan WeddingPress yang direkomendasikan yaitu versi 3 keatas, versi terlalu lama bisa menyebabkan konflik atau elemen tidak tampil sempurna.",
  },
  {
    q: "Koneksi Internet Stabil Saat Impor Template",
    a: "Saat mengimpor file JSON, koneksi yang tidak stabil bisa menyebabkan template gagal dimuat. Pastikan Anda memiliki koneksi internet yang baik saat proses impor template.",
  },
  {
    q: "Perhatikan Lisensi Penggunaan",
    a: "File template hanya boleh digunakan untuk kebutuhan pribadi atau jasa pembuatan undangan digital untuk klien. Tidak diperbolehkan menjual ulang atau membagikan file JSON secara bebas.",
  },
];

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

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`
        group rounded-lg overflow-hidden
        transition-all duration-300 border
        ${isOpen
          ? "bg-warning shadow-2xl border-warning scale-[1.02]"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
        }
      `}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <Typography
          variant="body-sm"
          as="span"
          className={`
            font-medium leading-snug transition-colors duration-200
            ${isOpen ? "!text-white" : "!text-white"}
          `}
        >
          {question}
        </Typography>

        <span
          className={`
            shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isOpen
              ? "bg-white/20 text-white"
              : "bg-white/10 text-white border border-white/20"
            }
          `}
        >
          {isOpen ? (
            <MinusIcon className="w-4 h-4" strokeWidth={3} />
          ) : (
            <PlusIcon className="w-4 h-4" strokeWidth={3} />
          )}
        </span>
      </button>

      <div
        style={{
          height: `${height}px`,
          transition: "height 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div ref={contentRef}>
          <div
            className={`
              mx-6 border-t transition-colors duration-300
              ${isOpen ? "border-white/20" : "border-white/10"}
            `}
          />
          <Typography
            variant="body-sm"
            as="p"
            className={`
              px-6 py-5 leading-relaxed transition-colors duration-300
              ${isOpen ? "!text-white/90" : "!text-white/70"}
            `}
          >
            {answer}
          </Typography>
        </div>
      </div>
    </div>

  );
}

export function WarnSection({ transparent = false }: { transparent?: boolean }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const handleToggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={`relative w-full overflow-hidden ${transparent ? 'pt-16 pb-16 md:pb-24' : 'bg-gradient-to-br from-[#01696f] to-[#0c4e54] py-16 md:py-24 shadow-2xl'}`}>
      {/* Decorative Circles from Hero */}
      {!transparent && (
        <>
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
        </>
      )}

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        {/* ── Header ── */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6">
            <Badge
              variant="glass"
              className="px-4 py-1.5 rounded-full border-white/30"
            >
              <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-white" />
              <Typography variant="caption" className="font-normal tracking-wider !text-white">
                Perlu Diperhatikan
              </Typography>
            </Badge>
          </div>
          <Typography variant="h2" className="text-center !text-white text-3xl md:text-4xl lg:text-5xl">
            Penting untuk Diketahui
          </Typography>
          <Typography variant="body-base" className="text-sm mt-4 text-center md:text-base !text-white/80 max-w-lg mx-auto leading-relaxed">
            Sebelum memulai penggunaan template, pastikan Anda memahami beberapa poin penting berikut demi kelancaran proses instalasi.
          </Typography>
        </div>

        {/* ── Accordion List ── */}
        <div className="flex flex-col gap-4">
          {warningItems.map((item, i) => (
            <AccordionItem
              key={i}
              question={item.q}
              answer={item.a}
              isOpen={openIdx === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


