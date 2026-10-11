import Link from "next/link";
import { ArrowUp, ArrowUpRight, Globe2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { company, type Locale, type SiteContent } from "@/lib/content";

export function Footer({
  copy: c,
  locale,
}: {
  copy: SiteContent;
  locale: Locale;
}) {
  return (
    <footer className="footer container viewport-stage" data-viewport-stage>
      <div className="footer-main">
        <div className="footer-brand">
          <a href="#top" aria-label="SarjHR">
            <Brand />
          </a>
          <p>{c.footer.description}</p>
          <a href={`mailto:${company.care}`}>
            <bdi>{company.care}</bdi>
          </a>
          <span className="footer-country">
            <span className="connection-dot" aria-hidden="true" />
            {c.footer.country}
          </span>
        </div>
        <div className="footer-column">
          <h3>{c.footer.platform}</h3>
          <a href="#platform">{c.nav.platform}</a>
          <a href="#integrations">{c.nav.integrations}</a>
          <a href="#why-sarj">{c.nav.why}</a>
          <a href={company.login} target="_blank" rel="noopener noreferrer">
            {c.nav.login}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="footer-column">
          <h3>{c.footer.company}</h3>
          <a href="#about">{c.footer.about}</a>
          <a href="#getting-started">{c.nav.start}</a>
          <a href={company.profile} target="_blank" rel="noopener noreferrer">
            {c.footer.profile}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Link href={locale === "ar" ? "/" : "/ar"}>
            <Globe2 size={14} aria-hidden="true" />
            <span lang={locale === "ar" ? "en" : "ar"}>
              {locale === "ar" ? "English" : "العربية"}
            </span>
          </Link>
        </div>
        <div className="footer-column">
          <h3>{c.footer.connect}</h3>
          <a href={`mailto:${company.care}`}>{c.footer.care}</a>
          <a href={`mailto:${company.support}`}>{c.footer.support}</a>
          <a href={`tel:${company.phone.replace(/\s/g, "")}`}>
            <bdi dir="ltr">{company.phone}</bdi>
          </a>
          <a href="#contact">
            {c.nav.demo}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 SarjHR. {c.footer.rights}</span>
        <span>
          {c.footer.owner} <span aria-hidden="true"> / </span>
          {c.footer.cr} <bdi>{company.registration}</bdi>
        </span>
        <a href="#top">
          {c.footer.top}
          <ArrowUp size={15} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
