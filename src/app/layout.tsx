import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Quicksand, Orbitron } from "next/font/google"; // ← ganti Jura → Orbitron
import Script from "next/script";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/context/cart-context";
import { CartSidebar } from "@/components/cart-sidebar";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// ← GANTI: Jura → Orbitron
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
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
    <html lang="id">
      {/* ← Ganti jura.variable → orbitron.variable */}
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${quicksand.variable} ${orbitron.variable} font-sans antialiased`}
      >
        <NextTopLoader
          color="#0d9488"
          height={3}
          showSpinner={false}
          shadow={false}
          easing="ease"
          speed={200}
        />

        <AuthProvider>
          <CartProvider>
            {children}
            {authModal}
            <CartSidebar />
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
