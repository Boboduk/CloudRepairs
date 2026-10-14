import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Section } from "../components/Section";
import { CasesGrid, PartnersCarousel } from "../components/Cases";
import { CtaBand } from "../components/CtaBand";
import { usePage, useSite } from "../data/SiteData";
import styles from "./pages.module.css";

export default function CasesListPage() {
  const site = useSite();
  const s = usePage("home").sections.cases;
  const description = "Проекты внедрения CloudRepairs: как предприятия автоматизируют техническое обслуживание и ремонты оборудования.";
  return (
    <>
      <Seo title="Кейсы — CloudRepairs" description={description} path="/cases/" />
      <PageHero breadcrumb="Кейсы" eyebrow={s.eyebrow} title={s.title || "Кейсы"} lead={description} />
      <Section>
        {site.cases.length ? <CasesGrid cases={site.cases} /> : <p className={styles.empty}>Кейсов пока нет.</p>}
      </Section>
      {site.partners.length > 0 && (
        <Section tone="cream" title={s.partnersTitle || "Партнеры"}>
          <PartnersCarousel partners={site.partners} label={s.partnersTitle || "Партнеры"} />
        </Section>
      )}
      <CtaBand />
    </>
  );
}
