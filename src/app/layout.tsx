import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted from npm (same families as before). next/font/google fetches CSS
// at build time with a Chrome 104 user agent, which Google Fonts now answers
// with extension-less URLs that Next 16.3's loader cannot parse, so every
// fresh build failed. Local files also remove the build's network dependency.
const inter = localFont({
  variable: "--font-inter",
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
});

const geist = localFont({
  variable: "--font-geist",
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  weight: "100 900",
  display: "swap",
});

const dmSans = localFont({
  variable: "--font-dm-sans",
  src: "../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  weight: "100 1000",
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
