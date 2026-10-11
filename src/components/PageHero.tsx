import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./PageHero.module.css";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  visual?: ReactNode;
  breadcrumb?: string;
  size?: "home" | "page";
}

/** Первый экран страницы: единственный H1 страницы, лид, кнопки и визуал */
export function PageHero({ eyebrow, title, lead, actions, visual, breadcrumb, size = "page" }: Props) {
  return (
    <section className={`${styles.hero} ${styles[size]}`}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={`container ${styles.grid} ${visual ? styles.withVisual : ""}`}>
        <div className={styles.copy}>
          {breadcrumb && (
            <nav aria-label="Хлебные крошки" className={styles.crumbs}>
              <Link to="/">Главная</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{breadcrumb}</span>
            </nav>
          )}
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        {visual && <div className={styles.visual}>{visual}</div>}
      </div>
    </section>
  );
}
