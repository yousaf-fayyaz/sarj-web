"use client";

import Link from "next/link";
import { ArrowUpRight, Globe2, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { company, type Locale, type SiteContent } from "@/lib/content";
import styles from "./navbar.module.css";

// Follow the page's section order; both menus and active tracking use this list.
const sectionLinks = [
  { id: "workspace-intro", label: "workspace", primary: true },
  { id: "integrations", label: "integrations", primary: true },
  { id: "platform", label: "platform", primary: true },
  { id: "workflows", label: "workflows", primary: false },
  { id: "why-sarj", label: "why", primary: true },
  { id: "about", label: "about", primary: false },
  { id: "for-your-team", label: "team", primary: false },
  { id: "getting-started", label: "start", primary: true },
  { id: "questions", label: "faq", primary: false },
  { id: "contact", label: "contact", primary: false },
] as const;

function MenuDots() {
  return (
    <span className={styles.menuDots} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function Navbar({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteContent["nav"];
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const navigatingToSection = useRef(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    let frame = 0;
    const sections = sectionLinks.map(({ id }) => ({
      id,
      element: document.getElementById(id),
    }));
    let positions: { id: string; top: number }[] = [];
    const update = () => {
      frame = 0;
      const current = positions
        .filter((section) => section.top - window.scrollY <= 180)
        .sort((a, b) => b.top - a.top)[0];
      setActive(current ? `#${current.id}` : "");
    };
    const measure = () => {
      positions = sections.map(({ id, element }) => ({
        id, top: (element?.getBoundingClientRect().top ?? Infinity) + window.scrollY,
      }));
      update();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    sections.forEach(({ element }) => { if (element) observer.observe(element); });
    const root = document.querySelector(".site");
    if (root) observer.observe(root);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [locale]);
  const links = sectionLinks.map(({ id, label, primary }) => ({
    href: `#${id}`,
    label: copy[label],
    primary,
  }));
  return (
    <header className="site-header sarj-header" data-scrolled={scrolled}>
      <nav
        className={`navbar sarj-navbar ${styles.navigation}`}
        aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}
      >
        <Link
          className="brand-link"
          href={locale === "ar" ? "/ar" : "/"}
          aria-label={locale === "ar" ? "سرج — الصفحة الرئيسية" : "SarjHR — Home"}
        >
          <Brand />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <div className={`desktop-nav ${styles.primaryLinks}`}>
            {links
              .filter((link) => link.primary)
              .map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active === link.href ? "location" : undefined}
                >
                  <span className={styles.linkLabel}>
                    <span>{link.label}</span>
                    <span aria-hidden="true">{link.label}</span>
                  </span>
                </a>
              ))}
            <SheetTrigger asChild>
              <button
                className={styles.moreButton}
              type="button"
              aria-label={copy.menu}
                onClick={(event) => {
                  menuTrigger.current = event.currentTarget;
                }}
              >
                <MenuDots />
              </button>
            </SheetTrigger>
          </div>
          <div className={`nav-actions ${styles.actions}`}>
            <Button className={styles.login} size="sm" asChild>
              <a href={company.login} target="_blank" rel="noopener noreferrer">
                <span>{copy.login}</span>
              </a>
            </Button>
            <Button className={`nav-demo ${styles.demo}`} size="sm" asChild>
              <a href="#contact">
                <span>{copy.demo}</span>
              </a>
            </Button>
            <SheetTrigger asChild>
              <Button
                className={`mobile-menu-button ${styles.mobileTrigger}`}
                variant="ghost"
                size="icon"
                aria-label={copy.menu}
                onClick={(event) => {
                  menuTrigger.current = event.currentTarget;
                }}
              >
                <MenuDots />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent
            className={`sarj-mobile-menu ${styles.menu}`}
            closeLabel={copy.close}
            dir={locale === "ar" ? "rtl" : "ltr"}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (!navigatingToSection.current) menuTrigger.current?.focus({ preventScroll: true });
              navigatingToSection.current = false;
            }}
          >
            <SheetTitle className="sr-only">{copy.menu}</SheetTitle>
            <SheetDescription className="sr-only">
              {copy.menuDescription}
            </SheetDescription>
            <Brand />
            <div className={`mobile-nav-links ${styles.menuLinks}`}>
              {links.map((link) => (
                <SheetClose key={link.href} asChild>
                  <a
                    href={link.href}
                    onClick={(event) => { navigatingToSection.current = !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey); }}
                    aria-current={active === link.href ? "location" : undefined}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                </SheetClose>
              ))}
            </div>
            <SheetClose asChild>
              <a className={styles.menuPhone} href={`tel:${company.phone.replace(/\s/g, "")}`}>
                <Phone size={17} aria-hidden="true" />
                <bdi dir="ltr">{company.phone}</bdi>
              </a>
            </SheetClose>
            <div className={styles.menuActions}>
              <SheetClose asChild>
                <Button asChild>
                  <a href="#contact" onClick={(event) => { navigatingToSection.current = !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey); }}>
                    {copy.demo}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <a
                  className="mobile-login"
                  href={company.login}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.login}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  className="mobile-language-switch"
                  href={locale === "ar" ? "/" : "/ar"}
                >
                  <Globe2 size={16} aria-hidden="true" />
                  <span lang={locale === "ar" ? "en" : "ar"}>
                    {locale === "ar" ? "English" : "العربية"}
                  </span>
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
