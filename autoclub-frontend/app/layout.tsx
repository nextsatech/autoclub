import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 👇 1. Importamos el Provider
import { ToastProvider } from "@/app/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autoclub Platform",
  description: "Organiza tus clases teóricas y de taller de forma fácil y ágil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 👇 2. Envolvemos el children con el ToastProvider */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}