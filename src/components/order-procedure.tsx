import React from "react";

const steps = [
  {
    number: 1,
    title: "Pilih Tema",
    desc: "Jelajahi tema undangan digital kami yang beragam. Pilih desain yang paling cocok untuk acara spesialmu.",
  },
  {
    number: 2,
    title: "Hubungi Admin",
    desc: "Klik tombol WhatsApp untuk langsung terhubung dengan tim kami. Kami siap menjawab pertanyaan dan membantu proses pemesananmu.",
  },
  {
    number: 3,
    title: "Isi Format Data",
    desc: "Setelah berkonsultasi dengan Admin, kamu akan diberikan format data yang perlu diisi sesuai informasi acaramu.",
  },
  {
    number: 4,
    title: "Lakukan Pembayaran",
    desc: "Selesaikan pembayaran sesuai instruksi admin. Kami menerima berbagai metode pembayaran untuk kenyamananmu.",
  },
  {
    number: 5,
    title: "Pesanan Diproses",
    desc: "Setelah pembayaran diterima, pesananmu segera kami proses dalam waktu 2×24 jam — bahkan bisa lebih cepat.",
  },
  {
    number: 6,
    title: "Pesanan Dikirim",
    desc: "Kami kirimkan link undangan untuk kamu cek dan revisi jika ada data yang perlu diperbaiki.",
  },
];

export function OrderProcedure() {
  return (
    <section className="w-full bg-primary py-12 md:py-24 relative overflow-hidden">
      {/* ── Background Dekorasi Ambient ── */}
      <div
        aria-hidden
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-foreground/10 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-foreground/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3"
      />

      <div className="mx-auto max-w-5xl px-5 md:px-0 relative z-10">
        {/* ── Section Header ── */}
        <div className="text-center mb-10 md:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/90 text-[11px] font-bold uppercase tracking-widest mb-5 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
            </span>
            Cara Pemesanan
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary-foreground tracking-tight mb-4">
            Prosedur Pemesanan
          </h2>
          <p className="text-sm md:text-base text-primary-foreground/70 max-w-lg mx-auto leading-relaxed">
            Langkah mudah dari konsultasi hingga undangan dikirim. Kami pastikan
            prosesnya lancar dan menyenangkan.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TIMELINE DESKTOP — Zigzag Alternating Minimalist     */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="hidden md:block relative">
          {/* ── Garis vertikal tengah glowing ── */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.3) 15%, rgba(255,255,255,0.3) 85%, transparent)",
            }}
          />

          <div className="flex flex-col gap-2">
            {steps.map((step, idx) => {
              const isLeft = idx % 2 === 0;
              const isLast = idx === steps.length - 1;

              return (
                <div
                  key={step.number}
                  className={`relative flex items-center gap-0 ${isLast ? "" : "pb-10"}`}
                >
                  {/* ── Sisi kiri ── */}
                  <div
                    className={`w-[calc(50%-2.5rem)] ${isLeft ? "pr-10" : "pl-10"} flex ${isLeft ? "justify-end" : "justify-start"}`}
                  >
                    {isLeft && <StepCardDesktop step={step} align="right" />}
                  </div>

                  {/* ── Node tengah (Angka sebagai Aksen) ── */}
                  <div className="shrink-0 w-20 flex flex-col items-center relative z-10 group">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-foreground shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                      <span className="text-xl font-black text-primary leading-none">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* ── Sisi kanan ── */}
                  <div
                    className={`w-[calc(50%-2.5rem)] ${isLeft ? "pl-10" : "pr-10"} flex ${isLeft ? "justify-start" : "justify-end"}`}
                  >
                    {!isLeft && <StepCardDesktop step={step} align="left" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TIMELINE MOBILE — 1 Baris Horizontal (Carousel)      */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="md:hidden relative -mx-5 px-5">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {steps.map((step) => {
              return (
                <div
                  key={step.number}
                  className="shrink-0 w-[325px] snap-center relative flex flex-row items-center gap-5 rounded-2xl p-5 bg-primary-foreground/15 border-4 border-primary-foreground/20 active:bg-primary-foreground/20 transition-colors duration-200"
                >
                  {/* Sisi Kiri: Angka sebagai Aksen */}
                  <div className="shrink-0 w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center shadow-lg">
                    <span className="text-xl font-black text-primary">
                      {step.number}
                    </span>
                  </div>

                  {/* Sisi Kanan: Konten Teks */}
                  <div className="flex-1 flex flex-col pr-2">
                    <h4 className="text-[16px] font-bold text-primary-foreground mb-1.5 leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-[13px] text-primary-foreground/70 leading-snug line-clamp-2">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indikator scroll kecil */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {steps.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary-foreground/30"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sub-komponen card untuk desktop timeline ───────────────────
function StepCardDesktop({
  step,
  align,
}: {
  step: (typeof steps)[0];
  align: "left" | "right";
}) {
  return (
    <div
      className={`
        group max-w-[400px] w-full
        rounded-2xl p-6
        bg-primary-foreground/10 hover:bg-primary-foreground/15
        border border-primary-foreground/20 hover:border-primary-foreground/40
        backdrop-blur-md
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-foreground/10
        ${align === "right" ? "text-right" : "text-left"}
      `}
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      <h4 className="text-xl font-bold text-primary-foreground mb-2 group-hover:text-white transition-colors">
        {step.title}
      </h4>
      <p className="text-sm text-primary-foreground/75 leading-relaxed group-hover:text-primary-foreground/90 transition-colors">
        {step.desc}
      </p>
    </div>
  );
}
