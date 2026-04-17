// src/app/layout.tsx

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/context/cart-context";
import { ThemeProvider } from "@/components/theme-provider";
import { CartSidebar } from "@/components/cart-sidebar";
import { MenuSidebar } from "@/components/menu-sidebar";
import { WhatsAppButton } from "@/components/whatsapp-button";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Custom Galeri Store",
  description: "Toko produk digital premium — Browse, Pay, Download.",
};

export default function RootLayout({
  children,
  authModal,
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <NextTopLoader
          color="#01696f"
          height={3}
          showSpinner={false}
          shadow={false}
          easing="ease"
          speed={200}
        />

        <AuthProvider>
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
              storageKey="nikarya-theme"
            >
              {children}
              {authModal}
              <CartSidebar />
              <MenuSidebar />
              <WhatsAppButton />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>

        <Script
          src={process.env.NEXT_PUBLIC_MIDTRANS_API_URL}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
