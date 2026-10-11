import { Link } from "react-router-dom";
import { CONTACTS, LOGIN_URL, NAV } from "../content/site";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo onDark />
          <p className={styles.tagline}>Информационная система по планированию и управлению тех. обслуживанием и ремонтом оборудования.</p>
        </div>
        <nav aria-label="Навигация в подвале">
          <h2 className={styles.title}>Разделы</h2>
          <ul className={styles.list}>
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to}>{n.label}</Link>
              </li>
            ))}
            <li>
              <a href={LOGIN_URL} target="_blank" rel="noopener noreferrer">
                Войти в систему
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={styles.title}>Контакты</h2>
          <ul className={styles.list}>
            {CONTACTS.map((c) => (
              <li key={c.value}>
                <a href={c.href} {...(c.kind === "telegram" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {c.value}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© CloudRepairs</span>
      </div>
    </footer>
  );
}
