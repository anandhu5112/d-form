import type { Metadata, Viewport } from "next";
import { Inter, Geist, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ashwin on Finance | Desh",
  description: "Start your NRI investment journey with Desh.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Android Chrome: shrink the layout viewport when the soft keyboard opens so
  // the focused field and the footer buttons stay reachable.
  interactiveWidget: "resizes-content",
  // Let the page paint under the notch/home indicator; safe-area insets below
  // keep the footer buttons clear of it.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">{children}</body>
    </html>
  );
}
