// src/components/order-procedure.tsx

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
    <section className="w-full bg-primary py-16 md:py-28 relative overflow-hidden">
      {/* ── Dekorasi ambient ── */}
      <div
        aria-hidden
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-foreground/8 rounded-full blur-[160px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-foreground/8 rounded-full blur-[140px] pointer-events-none translate-x-1/3 translate-y-1/3"
      />

      {/* ── Angka raksasa dekoratif di background ── */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span
          className="text-[20rem] font-black leading-none"
          style={{ color: "rgba(255,255,255,0.025)" }}
        >
          6
        </span>
      </div>

      <div className="mx-auto max-w-5xl px-5 md:px-0 relative z-10">
        {/* ── Section Header ── */}
        <div className="text-center mb-14 md:mb-24">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/90 text-[11px] font-bold uppercase tracking-widest mb-5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground" />
            </span>
            Cara Pemesanan
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary-foreground tracking-tight mb-4">
            Prosedur Pemesanan
          </h2>
          <p className="text-sm md:text-base text-primary-foreground/65 max-w-lg mx-auto leading-relaxed">
            Langkah mudah dari konsultasi hingga undangan dikirim. Kami pastikan
            prosesnya lancar dan menyenangkan.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* DESKTOP — Zigzag dengan angka besar sebagai node      */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="hidden md:block relative">
          {/* Garis vertikal — gradient dua warna */}
          <div
            className="absolute left-1/2 top-8 bottom-8 -translate-x-1/2"
            style={{
              width: "1px",
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.15) 10%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 90%, transparent)",
            }}
          />

          <div className="flex flex-col">
            {steps.map((step, idx) => {
              const isLeft = idx % 2 === 0;
              const isLast = idx === steps.length - 1;

              return (
                <div
                  key={step.number}
                  className={`relative flex items-center ${isLast ? "" : "pb-6"}`}
                >
                  {/* ── Sisi kiri ── */}
                  <div
                    className={`w-[calc(50%-2.5rem)] flex ${isLeft ? "justify-end pr-12" : "justify-start pl-12"}`}
                  >
                    {isLeft && <StepCardDesktop step={step} align="right" />}
                  </div>

                  {/* ── Node: lingkaran + angka besar ── */}
                  <div className="shrink-0 w-20 flex items-center justify-center relative z-10">
                    {/* Ring luar */}
                    <div
                      className="absolute w-20 h-20 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                      }}
                    />
                    {/* Lingkaran utama */}
                    <div
                      className="
                        relative w-16 h-16 rounded-full
                        flex items-center justify-center
                        transition-all duration-500
                        hover:scale-110
                        group cursor-default
                      "
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        boxShadow:
                          "0 0 0 4px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <span className="text-3xl font-black text-primary-foreground leading-none">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* ── Sisi kanan ── */}
                  <div
                    className={`w-[calc(50%-2.5rem)] flex ${isLeft ? "justify-start pl-12" : "justify-end pr-12"}`}
                  >
                    {!isLeft && <StepCardDesktop step={step} align="left" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* MOBILE — Horizontal Carousel                          */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="md:hidden relative -mx-5 px-5">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-6 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {steps.map((step) => (
              <div
                key={step.number}
                className="shrink-0 w-[240px] snap-center relative flex flex-col rounded-2xl p-5 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                {/* Shimmer pojok kanan bawah */}
                <div
                  aria-hidden
                  className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  }}
                />

                {/* Angka besar — ghost dekoratif di background card */}
                <div
                  aria-hidden
                  className="absolute -right-2 -bottom-3 leading-none font-black select-none pointer-events-none"
                  style={{
                    fontSize: "5rem",
                    color: "rgba(255,255,255,0.07)",
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </div>

                {/* Angka aktif kiri atas */}
                <span
                  className="text-5xl font-black leading-none mb-4 relative z-10"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {String(step.number).padStart(2, "0")}
                </span>

                <h4 className="text-sm font-bold text-primary-foreground mb-2 leading-tight relative z-10">
                  {step.title}
                </h4>
                <p className="text-xs text-primary-foreground/65 leading-relaxed relative z-10">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Dot indikator */}
          <div className="flex justify-center gap-1.5 pointer-events-none">
            {steps.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary-foreground/25"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── StepCard Desktop ───────────────────────────────────────────
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
        group max-w-[300px] w-full relative overflow-hidden
        rounded-2xl p-6
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        ${align === "right" ? "text-right" : "text-left"}
      `}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 24px rgba(0,0,0,0.1)",
      }}
    >
      {/* Shimmer pojok */}
      <div
        aria-hidden
        className={`
          absolute w-24 h-24 rounded-full pointer-events-none
          transition-opacity duration-300 opacity-0 group-hover:opacity-100
          ${align === "right" ? "-top-6 -right-6" : "-top-6 -left-6"}
        `}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Angka ghost dekoratif */}
      <div
        aria-hidden
        className={`
          absolute -bottom-4 font-black leading-none select-none pointer-events-none
          transition-opacity duration-300 opacity-60 group-hover:opacity-100
          ${align === "right" ? "-left-2" : "-right-2"}
        `}
        style={{
          fontSize: "6rem",
          color: "rgba(255,255,255,0.06)",
          lineHeight: 1,
        }}
      >
        {step.number}
      </div>

      <h4 className="text-base font-bold text-primary-foreground mb-2 relative z-10 group-hover:text-white transition-colors">
        {step.title}
      </h4>
      <p className="text-sm text-primary-foreground/70 leading-relaxed relative z-10 group-hover:text-primary-foreground/90 transition-colors">
        {step.desc}
      </p>
    </div>
  );
}
