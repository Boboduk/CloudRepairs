import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Section } from "../components/Section";
import { NewsCard } from "../components/NewsCard";
import { CtaBand } from "../components/CtaBand";
import { usePage, useSite } from "../data/SiteData";
import styles from "./pages.module.css";

export default function NewsListPage() {
  const site = useSite();
  const s = usePage("home").sections.news;
  const description = "Все о мире управления основными фондами, тех. обслуживаний и ремонтов, производственные практики.";
  return (
    <>
      <Seo title="Новости — CloudRepairs" description={description} path="/news/" />
      <PageHero breadcrumb="Новости" eyebrow={s.eyebrow} title="Новости" lead={description} />
      <Section>
        {site.news.length ? (
          <ul className={styles.newsGrid}>
            {site.news.map((n) => (
              <li key={n.id} className="reveal">
                <NewsCard item={n} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Новостей пока нет.</p>
        )}
      </Section>
      <CtaBand />
    </>
  );
}
