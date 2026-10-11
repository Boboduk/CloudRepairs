import { useContacts, usePage } from "../data/SiteData";
import { Button } from "./Button";
import { Icon } from "./Icon";
import styles from "./CtaBand.module.css";

/** «Остались вопросы? Просто задайте их нам» — салатовая плашка с действиями */
export function CtaBand({ subject }: { subject?: string }) {
  const { cta } = usePage("home").sections;
  const { requestHref, telegramUrl } = useContacts();
  return (
    <section className={styles.wrap} aria-label="Связаться с нами">
      <div className="container">
        <div className={`${styles.band} reveal`}>
          <svg className={styles.deco} viewBox="0 0 200 120" aria-hidden="true">
            <path d="M40 100a26 26 0 0 1 4-51.7A36 36 0 0 1 112 40a30 30 0 0 1 48 25 18 18 0 0 1-4 35z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
          </svg>
          <p className={styles.text}>{cta.text}</p>
          <div className={styles.actions}>
            <Button to={requestHref(subject)} variant="navy" size="lg">
              {cta.requestLabel}
            </Button>
            {telegramUrl && (
              <Button to={telegramUrl} variant="light" size="lg" icon={<Icon name="telegram" size={20} />}>
                {cta.telegramLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
