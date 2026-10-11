import { CONTACTS, LOGIN_URL } from "../content/site";
import { Icon } from "./Icon";
import { Button } from "./Button";
import styles from "./ContactsBlock.module.css";

const ICONS = { email: "mail", phone: "phone", telegram: "telegram" } as const;

/** Финальный блок с контактами (данные с cloudrepairs.ru) */
export function ContactsBlock({ id = "contacts" }: { id?: string }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className={styles.panel}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Контакты</p>
            <h2 id={`${id}-title`} className={styles.title}>
              Связаться с CloudRepairs
            </h2>
            <div className={styles.actions}>
              <Button to={LOGIN_URL} variant="light" size="lg" icon={<Icon name="external" size={18} />}>
                Войти в систему
              </Button>
            </div>
          </div>
          <ul className={styles.list}>
            {CONTACTS.map((c) => (
              <li key={c.value}>
                <a href={c.href} className={styles.contact} {...(c.kind === "telegram" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <span className={styles.icon}>
                    <Icon name={ICONS[c.kind]} size={22} />
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.label}>
                      {c.label}
                      {c.note && <> · {c.note}</>}
                    </span>
                    <span className={styles.value}>{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
