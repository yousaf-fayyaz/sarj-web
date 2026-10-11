import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Cloud,
  Download,
  Globe2,
  Headphones,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ContentRail } from "./content-rail";
import { HeroRays } from "./hero-rays";
import { company, type SiteContent, type Locale } from "@/lib/content";
import contactStyles from "./contact.module.css";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow">
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

export function Action({
  href,
  children,
  secondary = false,
  download = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  download?: boolean;
}) {
  return (
    <a
      className={`action ${secondary ? "action-secondary" : "action-primary"}`}
      href={href}
      download={download || undefined}
    >
      {children}
      <span className="action-arrow" aria-hidden="true">
        {download ? <Download size={16} /> : <ArrowUpRight size={17} />}
      </span>
    </a>
  );
}

export function Hero({
  copy: c,
  locale,
}: {
  copy: SiteContent;
  locale: Locale;
}) {
  return (
    <section className="opening viewport-stage" data-viewport-stage>
      <HeroRays />
      <div className="opening-index" aria-hidden="true">
        <span>{locale === "ar" ? "سرج / الموارد البشرية والرواتب" : "SARJ / HR & PAYROLL"}</span>
        <span>01 — 08</span>
      </div>
      <div className="container opening-grid">
        <div className="opening-title">
          <Eyebrow>{c.hero.eyebrow}</Eyebrow>
          <h1>
            {c.hero.first}
            <br />
            <span>{c.hero.second}</span>
          </h1>
          <p className="opening-tagline">{c.hero.tagline}</p>
          <div className="opening-seal">
            <span className="seal-symbol" aria-hidden="true">
              ✦
            </span>
            <span>{c.footer.country}</span>
            <span className="seal-divider" />
            <span>{locale === "ar" ? "عربية أولًا" : "Arabic-first"}</span>
          </div>
        </div>
        <div className="opening-copy">
          <p>{c.hero.description}</p>
          <div className="action-group">
            <Action href="#contact">{c.nav.demo}</Action>
            <Action href="#platform" secondary>
              {c.hero.secondary}
            </Action>
          </div>
        </div>
      </div>
      <a href="#workspace-intro" className="opening-scroll">
        <ArrowDown size={16} aria-hidden="true" />
        <span>{c.hero.workspaceLink}</span>
      </a>
    </section>
  );
}

export function Integrations({
  copy: c,
  locale,
}: {
  copy: SiteContent["integrations"];
  locale: Locale;
}) {
  return (
    <section
      className="integrations section container viewport-stage"
      id="integrations"
      data-viewport-stage
    >
      <div className="section-heading centered" data-reveal>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2>{c.first}</h2>
        <p>{c.description}</p>
      </div>
      <ContentRail className="integration-grid" label={c.first} locale={locale}>
        {c.items.map((item, i) => (
          <article className="integration-card" key={item.name}>
            <div className="integration-top">
              <span className="micro">{item.label}</span>
              <span className="connection-dot" aria-hidden="true" />
            </div>
            <div className={`integration-wordmark integration-wordmark-${i}`}>
              <span lang="ar" dir="rtl">
                {item.arabic}
              </span>
              <span>{item.name}</span>
            </div>
            <p>{item.description}</p>
            <span className="integration-line" aria-hidden="true" />
          </article>
        ))}
      </ContentRail>
      <p className="integration-caption">
        <span className="connection-dot" aria-hidden="true" />
        {c.footer}
      </p>
    </section>
  );
}

const differenceIcons = [Globe2, ShieldCheck, Cloud, Sparkles];

export function About({
  copy: c,
  locale,
}: {
  copy: SiteContent;
  locale: Locale;
}) {
  return (
    <>
      <section
        className="difference section viewport-stage"
        id="why-sarj"
        data-viewport-stage
      >
        <div className="container">
          <div className="section-heading centered" data-reveal>
            <Eyebrow>{c.why.eyebrow}</Eyebrow>
            <h2>{c.why.first}</h2>
            <p>{c.why.description}</p>
          </div>
          <ContentRail
            className="difference-grid"
            label={c.why.first}
            locale={locale}
          >
            {c.why.items.map((item, i) => {
              const Icon = differenceIcons[i];
              return (
                <article key={item.title}>
                  <Icon size={25} strokeWidth={1.3} aria-hidden="true" />
                  <span className="difference-number">0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </ContentRail>
        </div>
      </section>
      <section
        className="about section container viewport-stage"
        id="about"
        data-viewport-stage
      >
        <div className="about-content" data-reveal>
          <Eyebrow>{c.about.eyebrow}</Eyebrow>
          <h2>{c.about.first}</h2>
          {c.about.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="purpose-grid">
            <div>
              <h3>{c.about.vision}</h3>
              {c.about.visionText.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div>
              <h3>{c.about.mission}</h3>
              {c.about.missionText.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <a
            className="text-link"
            href={company.profile}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.about.profile}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}

export function Onboarding({
  copy: c,
  locale,
}: {
  copy: SiteContent["onboarding"];
  locale: Locale;
}) {
  return (
    <>
      <section
        className="onboarding section container viewport-stage"
        id="getting-started"
        data-viewport-stage
      >
        <div className="section-heading split" data-reveal>
          <div>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h2>{c.first}</h2>
          </div>
          <div>
            <p>{c.description}</p>
            <a className="text-link" href="#contact">
              {c.action}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <ContentRail
          className="onboarding-grid"
          label={c.first}
          locale={locale}
        >
          {c.steps.map((step, i) => (
            <article key={step.title}>
              <div className="step-top">
                <span className="step-number">0{i + 1}</span>
                <span className="step-connector" aria-hidden="true">
                  {i === 2 ? <Check size={20} /> : <ArrowUpRight size={20} />}
                </span>
              </div>
              <span className="micro">{c.progressLabels[i]}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </ContentRail>
        <div className="support-stage">
          <div className="support-strip">
            <div>
              <Headphones size={24} aria-hidden="true" />
              <div>
                <h3>{c.supportTitle}</h3>
                <p>{c.supportText}</p>
              </div>
            </div>
            <a href={`mailto:${company.care}`}>
              {c.care}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a href={`mailto:${company.support}`}>
              {c.support}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function Questions({
  copy: c,
  contact,
}: {
  copy: SiteContent["faq"];
  contact: string;
}) {
  return (
    <section
      className="questions section container viewport-stage"
      id="questions"
      data-viewport-stage
    >
      <div className="section-heading" data-reveal>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2>{c.title}</h2>
        <a className="text-link" href="#contact">
          {contact}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <div className="question-list" data-reveal>
        {c.items.map((item, i) => (
          <details key={item.question} name="sarj-questions">
            <summary>
              <span className="question-number">0{i + 1}</span>
              <span>{item.question}</span>
              <Plus size={20} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Contact({ copy: c }: { copy: SiteContent["contact"] }) {
  return (
    <section
      className={`${contactStyles.section} contact section container viewport-stage`}
      id="contact"
      data-viewport-stage
    >
      <div className={`${contactStyles.panel} contact-panel`} data-reveal>
        <div className={`${contactStyles.copy} contact-copy`}>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2>
            {c.first}
            <br />
            <span>{c.second}</span>
          </h2>
          <p>{c.description}</p>
          <div className={`${contactStyles.actions} action-group`}>
            <Action href={company.demo}>{c.demo}</Action>
            <Action href={company.profile} secondary download>
              {c.download}
            </Action>
          </div>
          <div className={contactStyles.methods}>
            <a className={`${contactStyles.email} contact-email`} href={`mailto:${company.care}`}>
              <Mail size={16} aria-hidden="true" />
              <bdi>{company.care}</bdi>
            </a>
            <a className={`${contactStyles.email} contact-email`} href={`tel:${company.phone.replace(/\s/g, "")}`}>
              <Phone size={16} aria-hidden="true" />
              <bdi dir="ltr">{company.phone}</bdi>
            </a>
          </div>
        </div>
      </div>
      <div className={`${contactStyles.support} contact-support`}>
        <span>{c.support}</span>
        <a href={`mailto:${company.support}`}>
          {c.supportLink}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
