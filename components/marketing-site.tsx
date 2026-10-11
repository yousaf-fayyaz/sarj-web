import { Navbar } from "@/components/layout/navbar";
import { Atmosphere } from "@/components/experience/atmosphere";
import {
  Hero,
  Integrations,
  About,
  Onboarding,
  Questions,
  Contact,
} from "@/components/experience/sections";
import { Platform } from "@/components/experience/platform";
import { Workspace } from "@/components/experience/workspace";
import { People } from "@/components/experience/people";
import { Footer } from "@/components/experience/footer";
import { EntranceMotion } from "@/components/experience/entrance-motion";
import { ArtworkMotion } from "@/components/experience/artwork-motion";
import { ScrollExperience } from "@/components/experience/scroll-experience";
import { ExperiencePreloader } from "@/components/experience/preloader";
import { content, type Locale } from "@/lib/content";

export function MarketingSite({ locale = "en" }: { locale?: Locale }) {
  const copy = content[locale];
  return (
    <ExperiencePreloader locale={locale}>
      <a className="skip-link" href="#main-content">
        {copy.footer.skip}
      </a>
      <Atmosphere />
      <ScrollExperience locale={locale} />
      <EntranceMotion />
      <ArtworkMotion />
      <Navbar locale={locale} copy={copy.nav} />
      <main id="main-content">
        <Hero copy={copy} locale={locale} />
        <Workspace
          copy={copy.preview}
          locale={locale}
          demo={copy.nav.demo}
          description={copy.hero.workspaceDescription}
        />
        <Integrations copy={copy.integrations} locale={locale} />
        <Platform copy={copy.features} locale={locale} />
        <About copy={copy} locale={locale} />
        <People copy={copy.people} locale={locale} />
        <Onboarding copy={copy.onboarding} locale={locale} />
        <Questions copy={copy.faq} contact={copy.nav.contact} />
        <Contact copy={copy.contact} />
      </main>
      <Footer copy={copy} locale={locale} />
    </ExperiencePreloader>
  );
}
