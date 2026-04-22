"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-[72px] animate-pulse rounded-full bg-muted/20" />
    );
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative h-8 w-[72px] cursor-pointer rounded-full p-1 shadow-inner transition-all duration-500 ease-in-out border-px ${
        isDark
          ? "bg-[#1b2a47] border-blue-900/30"
          : "bg-gradient-to-r from-[#93d5ed] to-[#f3d1b6] border-white/40"
      }`}
      aria-label="Toggle Theme"
    >
      {/* Container untuk awan/bintang */}
      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
        {/* Awan (Light Mode) */}
        {!isDark && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="absolute top-[16px] left-[32px] w-3.5 h-1.5 bg-white/60 rounded-full blur-[1px]" />
            <div className="absolute top-[7px] left-[42px] w-4.5 h-2 bg-white/80 rounded-full blur-[0.5px]" />
            <div className="absolute top-[20px] left-[48px] w-2.5 h-1.2 bg-white/40 rounded-full blur-[1px]" />
          </div>
        )}

        {/* Bintang (Dark Mode) */}
        {isDark && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="absolute top-[6px] left-[12px] w-0.5 h-0.5 bg-white rounded-full animate-twinkle" />
            <div className="absolute top-[16px] left-[22px] w-0.5 h-0.5 bg-white/80 rounded-full animate-twinkle [animation-delay:0.3s]" />
            <div className="absolute top-[10px] left-[32px] w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle [animation-delay:0.7s]" />
            <div className="absolute top-[20px] left-[15px] w-0.5 h-0.5 bg-white/40 rounded-full animate-twinkle [animation-delay:1.1s]" />
          </div>
        )}
      </div>

      {/* Toggle Thumb (Sun/Moon) */}
      <div
        className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${
          isDark
            ? "translate-x-[38px] bg-[#d1d5db] border-2 border-[#9ca3af]"
            : "translate-x-0 bg-gradient-to-br from-[#ffd900] to-[#ff9100] border-2 border-[#ffec8b]"
        }`}
      >
        {/* Sun Glow */}
        {!isDark && (
          <div className="absolute inset-0 rounded-full shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.8),0_0_8px_rgba(255,145,0,0.4)]" />
        )}

        {/* Moon craters */}
        {isDark && (
          <div className="relative w-full h-full overflow-hidden rounded-full">
            <div className="absolute top-[15%] left-[25%] w-[20%] h-[20%] rounded-full bg-[#9ca3af]/40" />
            <div className="absolute top-[50%] left-[15%] w-[15%] h-[15%] rounded-full bg-[#9ca3af]/40" />
            <div className="absolute top-[40%] left-[55%] w-[25%] h-[25%] rounded-full bg-[#9ca3af]/40" />
            <div className="absolute inset-0 rounded-full shadow-[inset_1.5px_-1.5px_3px_rgba(0,0,0,0.15)]" />
          </div>
        )}
      </div>
    </button>
  );
}
