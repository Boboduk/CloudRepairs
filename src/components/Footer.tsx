import { Link } from "react-router-dom";
import { CONTACTS, LOGIN_URL, NAV, requestHref } from "../content/site";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import styles from "./Footer.module.css";

const ICON = { email: "mail", phone: "phone", telegram: "telegram" } as const;

export function Footer() {
  return (
    <footer id="contacts" className={styles.footer} aria-labelledby="contacts-title">
      <img className={styles.watermark} src="/brand/symbol.png" alt="" aria-hidden="true" width={422} height={511} loading="lazy" />
      <div className={`container ${styles.top}`}>
        <div>
          <p className={styles.eyebrow}>Контакты</p>
          <h2 id="contacts-title" className={styles.title}>
            Остались вопросы? — задайте их нам на почту.
          </h2>
          <div className={styles.actions}>
            <a className={styles.cta} href={requestHref("Вопрос с сайта CloudRepairs")}>
              Связаться <Icon name="arrow" size={20} />
            </a>
          </div>
        </div>
        <ul className={styles.contacts}>
          {CONTACTS.map((c) => (
            <li key={c.value}>
              <a href={c.href} className={styles.contact} {...(c.kind === "telegram" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span className={styles.contactIcon}>
                  <Icon name={ICON[c.kind]} size={22} />
                </span>
                <span className={styles.contactMeta}>
                  <span className={styles.contactLabel}>
                    {c.label}
                    {c.note && ` · ${c.note}`}
                  </span>
                  <span className={styles.contactValue}>{c.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className={`container ${styles.bottom}`}>
        <Logo />
        <nav aria-label="Навигация в подвале" className={styles.nav}>
          {NAV.filter((n) => n.to !== "#contacts").map((n) => (
            <Link key={n.to} to={n.to}>
              {n.label}
            </Link>
          ))}
          <a href={LOGIN_URL} target="_blank" rel="noopener noreferrer">
            Войти в систему
          </a>
        </nav>
        <p className={styles.copy}>©2026 Cloudrepairs</p>
      </div>
    </footer>
  );
}
