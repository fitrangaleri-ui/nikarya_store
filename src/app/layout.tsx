import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/context/cart-context";
import { CartSidebar } from "@/components/cart-sidebar";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
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
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <NextTopLoader
          color="#6B4226"
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
