import type { Metadata, Viewport } from "next";
import { Poppins, IBM_Plex_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./people-experience.css";
import "./artwork-motion.css";
import "./service-experience.css";
import "./viewport-experience.css";

const instrument = localFont({
  src: "../public/fonts/instrument-sans.woff2",
  variable: "--font-instrument",
  weight: "400 700",
  display: "optional",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
  preload: false,
});
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sarj.sa"),
  title: "SarjHR | HR & Payroll for Saudi Organisations",
  description:
    "Manage HR and payroll with SARJ, a Saudi cloud platform for attendance, leave and employee services. Arabic-first, with full English support.",
  alternates: { canonical: "/", languages: { en: "/", ar: "/ar" } },
  openGraph: {
    type: "website",
    siteName: "SarjHR",
    title: "SarjHR | HR & Payroll for Saudi Organisations",
    description:
      "Attendance, leave, payroll and employee services in one cloud platform, with Mudad, GOSI and Muqeem integrations.",
    locale: "en_US",
    alternateLocale: "ar_SA",
    url: "/",
    images: [
      {
        url: "/images/social-card.png",
        width: 1200,
        height: 630,
        alt: "SarjHR — HR and payroll in one platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SarjHR | HR & Payroll for Saudi Organisations",
    description:
      "Attendance, leave, payroll and employee services in one cloud platform, with Mudad, GOSI and Muqeem integrations.",
    images: ["/images/social-card.png"],
  },
};
export const viewport: Viewport = {
  themeColor: "#020905",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${poppins.variable} ${arabic.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
