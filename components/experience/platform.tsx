import {
  ArrowUpRight,
  Check,
  Banknote,
  CalendarDays,
  Smartphone,
  Files,
  Fingerprint,
  TrendingUp,
} from "lucide-react";
import { ModuleLineArt } from "./module-line-art";
import { moduleSubjects } from "@/lib/module-shapes";
import { ServiceRail } from "./service-rail";
import { ServiceStory } from "./service-story";
import { Eyebrow } from "./sections";
import { type SiteContent, type Locale } from "@/lib/content";
import styles from "./platform.module.css";

const icons = [
  Banknote,
  Fingerprint,
  CalendarDays,
  Smartphone,
  TrendingUp,
  Files,
];

export function Platform({
  copy: c,
  locale,
}: {
  copy: SiteContent["features"];
  locale: Locale;
}) {
  return (
    <section className="platform section" id="platform">
      <div className="container">
        <div
          className={`${styles.overview} platform-overview viewport-stage`}
          data-viewport-stage
          data-in-view="false"
        >
          <div className={`${styles.heading} section-heading`}>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h2>
              {c.first}
              <br />
              <span>{c.second}</span>
            </h2>
            <p>{c.description}</p>
          </div>
          <div className={styles.railStage}>
            <ServiceRail
              labels={c.items.map((item) => item.chapter)}
              hint={c.tag}
              previous={c.previous}
              next={c.next}
              goTo={c.goTo}
              locale={locale}
            >
              {c.items.map((item, i) => {
                const Icon = icons[i];
                return (
                  <a
                    className={`${styles.card} service-card service-card-${i}`}
                    key={item.label}
                    href={`#module-${i + 1}`}
                    draggable={false}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <div className="service-card-topline">
                      <span className="service-card-label">
                        <Icon size={16} strokeWidth={1.4} aria-hidden="true" />
                        {item.label}
                      </span>
                      <span className="service-card-index">0{i + 1}</span>
                    </div>
                    <ModuleLineArt subject={moduleSubjects[i]} index={i} />
                    <div className="service-card-copy">
                      <h3>{item.chapter}</h3>
                      <p>{item.summary}</p>
                      <ul>
                        {item.details.map((detail) => (
                          <li key={detail}>
                            <Check size={12} aria-hidden="true" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="service-card-footer">
                      <span>
                        {locale === "ar"
                          ? "شاهد مسار العمل"
                          : "See the workflow"}
                      </span>
                      <span className="service-card-arrow">
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </ServiceRail>
          </div>
        </div>
        <ServiceStory items={c.items} locale={locale} explore={c.explore} />
      </div>
    </section>
  );
}
