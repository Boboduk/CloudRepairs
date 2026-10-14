import type { ReactNode } from "react";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { Icon, type IconName } from "../components/Icon";
import { Section } from "../components/Section";
import { CtaBand } from "../components/CtaBand";
import { Figure } from "../components/Figure";
import { SmartLink } from "../components/SmartLink";
import { PartnersCarousel } from "../components/Cases";
import { usePage, useSite } from "../data/SiteData";
import { detailPath } from "../../shared/routes";
import styles from "./pages.module.css";

export default function AboutPage() {
  const site = useSite();
  const page = usePage("about");
  const { hero, principles, team, partners } = page.sections;

  const blocks: Record<string, ReactNode> = {
    principles: (
      <Section key="principles" id="principles" eyebrow={principles.eyebrow} title={principles.title}>
        <ul className={styles.principles}>
          {principles.items.map((p, i) => (
            <li key={i} className={`${styles.principle} reveal`}>
              <span className={styles.principleIcon}>
                <Icon name={p.icon as IconName} size={26} />
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
        {principles.quote && <p className={`${styles.quote} reveal`}>{principles.quote}</p>}
        {principles.image && <Figure src={principles.image} caption={principles.imageCaption} className={styles.wideFigure} />}
      </Section>
    ),
    team: (
      <Section key="team" id="team" tone="cream" eyebrow={team.eyebrow} title={team.title} lead={team.lead}>
        {team.image && <Figure src={team.image} caption={team.imageCaption} className={styles.wideFigure} />}
        {team.buttons.length > 0 && (
          <div className={`${styles.row} reveal`}>
            {team.buttons.map((b, i) => (
              <Button key={i} to={b.href || "/"} variant={i === 0 ? "navy" : "outline"} icon={i === 0 ? <Icon name="arrow" size={18} /> : undefined}>
                {b.label}
              </Button>
            ))}
          </div>
        )}
      </Section>
    ),
    partners:
      site.cases.length || site.partners.length ? (
        <Section key="partners" id="cases-partners" eyebrow={partners.eyebrow} title={partners.title}>
          {site.cases.length > 0 && (
            <div className="reveal">
              <p className={styles.groupLabel}>{partners.casesLabel}</p>
              <ul className={`${styles.nameList} ${styles.nameGrid}`}>
                {site.cases.map((c) => (
                  <li key={c.id}>{c.hasPage ? <SmartLink to={detailPath("cases", c.slug)}>{c.title}</SmartLink> : c.title}</li>
                ))}
              </ul>
            </div>
          )}
          {site.partners.length > 0 && (
            <div className={`${styles.partnersBlock} reveal`}>
              <p className={styles.groupLabel}>{partners.partnersLabel}</p>
              <PartnersCarousel partners={site.partners} label={partners.partnersLabel || "Партнеры"} />
            </div>
          )}
        </Section>
      ) : null,
  };

  return (
    <>
      <Seo title={page.seoTitle} description={page.seoDescription} path="/about/" />
      <PageHero
        breadcrumb="О нас"
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        actions={
          hero.buttonLabel && hero.buttonHref ? (
            <Button to={hero.buttonHref} size="lg" icon={<Icon name="arrow" size={20} />}>
              {hero.buttonLabel}
            </Button>
          ) : undefined
        }
      />
      {page.order.map((k) => blocks[k] ?? null)}
      <CtaBand />
    </>
  );
}
