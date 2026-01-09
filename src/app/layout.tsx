import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Analisis Curah Hujan - Regresi & Prediksi",
  description: "Web aplikasi untuk analisis regresi dan prediksi curah hujan menggunakan Machine Learning dengan model ONNX",
  keywords: ["curah hujan", "regresi", "prediksi", "machine learning", "gradient boosting", "ONNX"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.variable}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
