import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseCheck — Weekly Check-ins & Coaching Insights",
  description: "Track client check-ins, weight, workouts, sleep, and metrics with automated alerts for elite coaches and active clients.",
  keywords: ["coaching", "client tracking", "fitness check-in", "metrics tracking", "weight tracking", "pulse check"],
  openGraph: {
    title: "PulseCheck — Weekly Check-ins & Coaching Insights",
    description: "Elite tracking platform for coaches and clients.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:font-semibold focus:rounded-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
