import { Fingerprint, Users, Wallet } from "lucide-react";
import { type Locale, type SiteContent } from "@/lib/content";
import {
  audienceRoles,
  getPeoplePreview,
} from "@/lib/people-preview";
import { Eyebrow, Action } from "./sections";
import { PeopleArtwork } from "./people-artwork";
import styles from "./people-columns.module.css";

const roleIcons = [Users, Wallet, Fingerprint];

export function People({
  copy: c,
  locale,
}: {
  copy: SiteContent["people"];
  locale: Locale;
}) {
  const preview = getPeoplePreview(locale);
  const ar = locale === "ar";

  return (
    <section
      className={`people section viewport-stage ${styles.section}`}
      id="for-your-team"
      data-viewport-stage
      data-canvas-scroll-span="stage"
      aria-labelledby="people-heading"
    >
      <div className="container">
        <div className={styles.intro} data-reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 id="people-heading">{c.first}</h2>
          <p>{preview.hint}</p>
        </div>
        <div className={styles.rows}>
          {audienceRoles.map((role, i) => {
            const Icon = roleIcons[i];
            const panel = c.panels[i];
            return (
              <article className={styles.row} key={role} aria-labelledby={`people-role-${role}`} data-reveal>
                <div className={styles.copy}>
                  <div className={styles.label}>
                    <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                    <span>{c.tabs[i]}</span>
                  </div>
                  <h3 id={`people-role-${role}`}>{panel.title}</h3>
                  <p>{panel.description}</p>
                  <Action href="#workspace-intro">
                    {ar ? "استكشف مساحة العمل" : "Explore the workspace"}
                  </Action>
                </div>
                <div className={styles.visual}>
                  <PeopleArtwork role={role} />
                  <span className={styles.number} aria-hidden="true">0{i + 1}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
