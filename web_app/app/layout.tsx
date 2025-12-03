import type { Metadata } from "next";
import { Nunito, Fjalla_One } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { Providers } from "@/lib/providers";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fjalla",
});

export const metadata: Metadata = {
  title: "Airmass Xpress - Get Anything Done",
  description: "Connect with skilled taskers for any job. From cleaning to assembly, find trusted help in your area.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fjallaOne.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
