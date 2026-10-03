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

export const metadata = {
  title: "Interactive 3D Solar System | Next.js & Three.js",
  description:
    "Explore the 8 planets, the Sun, and moons in an interactive 3D Solar System simulation built with Next.js, React Three Fiber, and Three.js.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full w-full bg-[#030308] text-zinc-100 overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
