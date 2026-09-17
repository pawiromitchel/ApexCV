import type { Metadata } from "next";
import { Inter, Merriweather, Roboto_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ApexCV | Modern High-Impact CV & Resume Builder",
  description: "Next-generation CV builder with industry-standard templates, live split-screen preview, instant autosave, and pixel-perfect PDF export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${merriweather.variable} ${robotoMono.variable} ${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
