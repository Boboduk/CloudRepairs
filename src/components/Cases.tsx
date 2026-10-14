import { Link } from "react-router-dom";
import type { CaseListItem, Partner } from "../../shared/types";
import { detailPath } from "../../shared/routes";
import { Carousel } from "./Carousel";
import styles from "./Cases.module.css";

/** Карточки кейсов: на главной (первые 3) и на странице /cases/ */
export function CasesGrid({ cases }: { cases: CaseListItem[] }) {
  if (!cases.length) return null;
  return (
    <ul className={styles.cases}>
      {cases.map((c) => {
        const inner = (
          <>
            {c.cover && <img className={styles.caseCover} src={c.cover.url} alt={c.cover.alt || c.title} loading="lazy" />}
            <span className={styles.caseText}>
              <span className={styles.caseName}>{c.title}</span>
              {c.excerpt && <span className={styles.caseExcerpt}>{c.excerpt}</span>}
            </span>
            <img src="/brand/symbol.png" alt="" aria-hidden="true" className={styles.caseMark} width={422} height={511} loading="lazy" />
          </>
        );
        return (
          <li key={c.id} className={`${styles.case} ${c.cover ? styles.caseWithCover : ""} reveal`}>
            {c.hasPage ? (
              <Link to={detailPath("cases", c.slug)} className={styles.caseLink}>
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Логотипы партнёров каруселью (главная и «О нас») */
export function PartnersCarousel({ partners, label = "Партнеры" }: { partners: Partner[]; label?: string }) {
  if (!partners.length) return null;
  return (
    <Carousel
      label={label}
      perView={{ lg: 4, md: 3, sm: 2 }}
      autoplay={4500}
      items={partners.map((p) => {
        const content = p.logo ? <img src={p.logo.url} alt={p.logo.alt || p.name} className={styles.partnerLogo} loading="lazy" /> : <span>{p.name}</span>;
        return p.url ? (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className={styles.partner} aria-label={p.name} title={p.description || p.name}>
            {content}
          </a>
        ) : (
          <div key={p.id} className={styles.partner} title={p.description || undefined}>
            {content}
          </div>
        );
      })}
    />
  );
}
