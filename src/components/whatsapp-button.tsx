"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Typography } from "@/components/ui/typography";

const WHATSAPP_BASE_URL = "https://wa.me/6285155201380";
const WHATSAPP_TOGGLE_EVENT = "whatsapp:toggle";
const DEFAULT_WHATSAPP_MESSAGE = "Halo, saya ingin memesan undangan digital ?";

type WhatsAppToggleDetail = {
  message?: string;
};

function buildWhatsAppUrl(message?: string) {
  const text =
    typeof message === "string" ? message.trim() : DEFAULT_WHATSAPP_MESSAGE;

  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(
    text || DEFAULT_WHATSAPP_MESSAGE,
  )}`;
}

export function WhatsAppButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_WHATSAPP_MESSAGE);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Perbarui setiap menit

    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent<WhatsAppToggleDetail>;
      const newMessage = customEvent.detail?.message;

      if (typeof newMessage === "string") {
        setMessage(newMessage);
      } else {
        setMessage(DEFAULT_WHATSAPP_MESSAGE);
      }
      setIsOpen((open) => !open);
    };

    window.addEventListener(WHATSAPP_TOGGLE_EVENT, handleToggle);

    return () => {
      window.removeEventListener(WHATSAPP_TOGGLE_EVENT, handleToggle);
      clearInterval(interval);
    };
  }, []);

  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus textarea when visible
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isVisible]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Sync height on message/visibility change
  useEffect(() => {
    if (isVisible) {
      autoResize();
    }
  }, [message, isVisible, autoResize]);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    window.open(buildWhatsAppUrl(trimmed), "_blank", "noreferrer");
    setIsOpen(false);
    setMessage(DEFAULT_WHATSAPP_MESSAGE);
  }, [message]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Jangan tampilkan di halaman admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* ── FAB Button ── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-end px-4 md:right-6 md:left-auto md:px-0">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Tutup WhatsApp" : "Buka WhatsApp"}
          className="pointer-events-auto relative hidden h-16 w-16 items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 md:flex"
        >
          <span className="absolute right-1 top-1 z-10 h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-white" />
          <Image
            src="/icon/logo-whatsapp.png"
            alt="WhatsApp"
            width={48}
            height={48}
            className="h-full w-full object-contain filter drop-shadow-lg"
          />
        </button>
      </div>

      {/* ── Centered Modal ── */}
      {isRendered && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
              }`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            className={`relative w-full max-w-[320px] overflow-hidden rounded-3xl bg-background/95 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.2)] border border-border/50 ring-0 transition-all duration-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between bg-[#1f6a6b]/95 px-4 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/20">
                  <Image
                    src="/customer.jpg"
                    alt="Admin Profile"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <Typography variant="body-base" as="p" className="text-base font-semibold text-white">Custom Galeri Store</Typography>
                    <Image
                      src="/icon/verify.png"
                      alt="Verified"
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 object-contain pb-0.5"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-white/80">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Typography variant="caption" as="span" className="text-white/80">Online</Typography>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup WhatsApp popup"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-5 space-y-5 bg-gradient-to-b from-muted/20 to-transparent">
              <div className="rounded-2xl bg-card dark:bg-card p-4 text-card-foreground shadow-sm border border-border/40 relative">
                <div className="absolute -left-1.5 top-4 w-3 h-3 bg-card border-l border-t border-border/40 rotate-[-45deg]" />
                <div className="flex items-center justify-between">
                  <Typography variant="caption" as="p" className="font-medium text-primary uppercase tracking-tight">
                    Customer Support
                  </Typography>
                  <Typography variant="caption" as="span" className="text-[10px] text-muted-foreground font-medium">
                    {currentTime}
                  </Typography>
                </div>
                <Typography variant="body-sm" as="p" className="mt-1.5 leading-relaxed text-foreground/70 font-normal whitespace-pre-wrap">
                  Halo! Ada yang bisa kami bantu mengenai pesanan atau info produk?
                </Typography>
              </div>

              {/* Chat Input Bar */}
              <div className="space-y-1.5">
                <div className="flex items-end gap-2 rounded-2xl bg-card border border-border/40 px-3 py-2 shadow-sm">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      autoResize();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pesan..."
                    rows={1}
                    style={{ resize: "none", minHeight: "36px", maxHeight: "160px" }}
                    className="flex-1 bg-transparent text-sm text-foreground leading-relaxed outline-none placeholder:text-muted-foreground overflow-y-auto py-1 custom-scrollbar"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    aria-label="Kirim pesan WhatsApp"
                    disabled={!message.trim()}
                    className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white transition-all hover:bg-[#1fbc59] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </button>
                </div>
                <Typography variant="caption" as="p" className="text-center text-[10px] text-muted-foreground/70">
                  Pesan akan dikirim melalui WhatsApp · Tekan Enter untuk mengirim
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function openWhatsAppPreview(message?: string) {
  window.dispatchEvent(
    new CustomEvent<WhatsAppToggleDetail>(WHATSAPP_TOGGLE_EVENT, {
      detail: { message },
    }),
  );
}
