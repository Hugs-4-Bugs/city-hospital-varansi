import type { Metadata } from "next";
import { Inter, Fraunces, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const devanagari = Noto_Serif_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "City Hospital, Sigra, Varanasi | Gynaecology, Maternity & 24×7 Emergency Care",
  description:
    "City Hospital (सिटी हॉस्पिटल), Chandrika Nagar, Sigra, Varanasi — multi-specialty care led by Dr. Anjali Yadav (Gynaecology & Maternity). Open 24 hours with emergency services, general surgery, orthopedics and diagnostics.",
  keywords: [
    "City Hospital Varanasi",
    "Sigra hospital",
    "Dr. Anjali Yadav",
    "gynaecologist Varanasi",
    "maternity hospital Varanasi",
    "24 hours hospital Varanasi",
    "emergency care Varanasi",
  ],
  authors: [{ name: "Prabhat Kumar" }],
  openGraph: {
    title: "City Hospital, Sigra, Varanasi | 24×7 Multi-Specialty Care",
    description:
      "Gynaecology & maternity care under Dr. Anjali Yadav, round-the-clock emergency, surgery, orthopedics & diagnostics. Open 24 hours in Sigra, Varanasi.",
    type: "website",
    locale: "en_IN",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} ${devanagari.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
