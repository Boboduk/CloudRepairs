import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./PageHero.module.css";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  breadcrumb?: string;
  children?: ReactNode;
}

/** Первый экран внутренних страниц: тёмно-синий фон, единственный H1 страницы */
export function PageHero({ eyebrow, title, lead, actions, aside, breadcrumb, children }: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.bg} aria-hidden="true">
        <span className={styles.glowLime} />
        <span className={styles.glowSky} />
        <img src="/brand/symbol.png" alt="" className={styles.symbol} width={422} height={511} />
      </div>
      <div className={`container ${styles.inner}`}>
        <div className={`${styles.grid} ${aside ? styles.withAside : ""}`}>
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
          {aside && <div className={styles.aside}>{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
