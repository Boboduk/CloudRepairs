import { Link } from "react-router-dom";
import { NAV } from "../content/site";
import { useContacts, useSite } from "../data/SiteData";
import { Logo } from "./Logo";
import { Icon, type IconName } from "./Icon";
import styles from "./Footer.module.css";

interface ContactItem {
  icon: IconName;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export function Footer() {
  const site = useSite();
  const { settings: s, requestHref } = useContacts();
  const contacts: ContactItem[] = [
    s.email && { icon: "mail" as const, label: "Почта", value: s.email, href: `mailto:${s.email}` },
    s.telegramPersonal && { icon: "telegram" as const, label: "Телеграм", value: `@${s.telegramPersonal}`, href: `https://t.me/${s.telegramPersonal}`, external: true },
    s.telegramMain && { icon: "telegram" as const, label: "Телеграм", value: `@${s.telegramMain}`, href: `https://t.me/${s.telegramMain}`, external: true },
    s.phone && { icon: "phone" as const, label: s.phoneNote ? `Телефон · ${s.phoneNote}` : "Телефон", value: s.phone, href: `tel:${s.phone.replace(/[^\d+]/g, "").replace(/^8/, "+7")}` },
  ].filter(Boolean) as ContactItem[];
  const nav = NAV.filter((n) => n.to !== "#contacts");
  if (site.news.length) nav.push({ label: "Новости", to: "/news/" });

  return (
    <footer id="contacts" className={styles.footer} aria-labelledby="contacts-title">
      <img className={styles.watermark} src="/brand/symbol.png" alt="" aria-hidden="true" width={422} height={511} loading="lazy" />
      <div className={`container ${styles.top}`}>
        <div>
          <p className={styles.eyebrow}>Контакты</p>
          <h2 id="contacts-title" className={styles.title}>
            {s.footerTitle}
          </h2>
          <div className={styles.actions}>
            <a className={styles.cta} href={requestHref("Вопрос с сайта CloudRepairs")}>
              {s.footerButton} <Icon name="arrow" size={20} />
            </a>
          </div>
        </div>
        <ul className={styles.contacts}>
          {contacts.map((c) => (
            <li key={c.value}>
              <a href={c.href} className={styles.contact} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span className={styles.contactIcon}>
                  <Icon name={c.icon} size={22} />
                </span>
                <span className={styles.contactMeta}>
                  <span className={styles.contactLabel}>{c.label}</span>
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
          {nav.map((n) => (
            <Link key={n.to} to={n.to}>
              {n.label}
            </Link>
          ))}
        </nav>
        <p className={styles.copy}>{s.copyright}</p>
      </div>
    </footer>
  );
}
