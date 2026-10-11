import type { Metadata } from "next";
import { MarketingSite } from "@/components/marketing-site";

export const metadata: Metadata = {
  title: "سرج HR | الموارد البشرية والرواتب للمنشآت السعودية",
  description:
    "أدر الموارد البشرية والرواتب مع سرج، منصة سحابية سعودية للحضور والإجازات وخدمات الموظفين. مصممة للعربية، مع دعم كامل للإنجليزية.",
  alternates: { canonical: "/ar", languages: { en: "/", ar: "/ar" } },
  twitter: {
    card: "summary_large_image",
    title: "سرج HR | الموارد البشرية والرواتب للمنشآت السعودية",
    description: "الحضور والإجازات والرواتب وخدمات الموظفين في منصة سحابية واحدة، مع تكاملات مدد والتأمينات الاجتماعية ومقيم.",
    images: ["/images/social-card.png"],
  },
  openGraph: {
    title: "سرج HR | الموارد البشرية والرواتب للمنشآت السعودية",
    description: "الحضور والإجازات والرواتب وخدمات الموظفين في منصة سحابية واحدة، مع تكاملات مدد والتأمينات الاجتماعية ومقيم.",
    locale: "ar_SA",
    url: "/ar",
    images: [
      {
        url: "/images/social-card.png",
        width: 1200,
        height: 630,
        alt: "سرج HR — الموارد البشرية والرواتب في منصة واحدة",
      },
    ],
  },
};

export default function ArabicHome() {
  return <MarketingSite locale="ar" />;
}
