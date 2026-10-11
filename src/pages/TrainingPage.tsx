import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { CtaBand } from "../components/CtaBand";
import { Figure } from "../components/Figure";
import { useContacts, usePage } from "../data/SiteData";
import styles from "./pages.module.css";

const ICONS = ["users", "route", "shield", "spark", "layers", "factory", "monitor", "gantt"] as const;

export default function TrainingPage() {
  const page = usePage("training");
  const { hero, directions } = page.sections;
  const { requestHref, telegramUrl } = useContacts();
  const anchor = (d: { id: string }, i: number) => d.id || `napravlenie-${i + 1}`;

  return (
    <>
      <Seo title={page.seoTitle} description={page.seoDescription} path="/obuchen/" />
      <PageHero
        breadcrumb="Обучение"
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        actions={
          <>
            <Button to={requestHref("Обучение и консультация — заявка")} size="lg" icon={<Icon name="arrow" size={20} />}>
              {hero.requestLabel}
            </Button>
            {telegramUrl && (
              <Button to={telegramUrl} variant="outlineLight" size="lg" icon={<Icon name="telegram" size={20} />}>
                {hero.telegramLabel}
              </Button>
            )}
          </>
        }
      >
        <ul className={styles.heroCards}>
          {directions.items.map((d, i) => (
            <li key={i}>
              <a href={`#${anchor(d, i)}`} className={styles.heroCard}>
                <span className={styles.heroCardIcon}>
                  <Icon name={ICONS[i % ICONS.length]} size={24} />
                </span>
                <span className={styles.heroCardNum}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.heroCardTitle}>{d.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </PageHero>

      {directions.items.map((d, i) => (
        <Section key={i} id={anchor(d, i)} tone={i % 2 ? "cream" : "default"}>
          <div className={`${styles.split} reveal`}>
            <div>
              <p className={styles.kicker}>{String(i + 1).padStart(2, "0")}</p>
              <h2 id={`${anchor(d, i)}-title`} className={styles.splitTitle}>
                {d.title}
              </h2>
              {d.image && <Figure src={d.image} caption={d.imageCaption} alt={d.title} className={styles.sideFigure} />}
            </div>
            <div className={styles.splitBody}>
              {d.lead && <p className={styles.splitLead}>{d.lead}</p>}
              {d.items.length > 0 && (
                <ul className={styles.steps}>
                  {d.items.map((item, j) => (
                    <li key={j}>
                      <span className={styles.stepIcon}>
                        <Icon name="check" size={18} strokeWidth={2.4} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <Button to={requestHref(`${d.title} — заявка`)} variant="navy" icon={<Icon name="arrow" size={18} />}>
                  {hero.requestLabel}
                </Button>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <CtaBand subject="Вопрос об обучении" />
    </>
  );
}
