import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { CtaBand } from "../components/CtaBand";
import { SEO } from "../content/seo";
import { TELEGRAM_URL, requestHref } from "../content/site";
import { TRAINING_DIRECTIONS, TRAINING_HERO } from "../content/training";
import styles from "./pages.module.css";

const ICONS = ["users", "route", "shield"] as const;

export default function TrainingPage() {
  return (
    <>
      <Seo page={SEO["/obuchen/"]} />
      <PageHero
        breadcrumb="Обучение"
        eyebrow={TRAINING_HERO.eyebrow}
        title={TRAINING_HERO.title}
        lead={TRAINING_HERO.lead}
        actions={
          <>
            <Button to={requestHref("Обучение и консультация — заявка")} size="lg" icon={<Icon name="arrow" size={20} />}>
              Оставить заявку
            </Button>
            <Button to={TELEGRAM_URL} variant="outlineLight" size="lg" icon={<Icon name="telegram" size={20} />}>
              Написать в Телеграм
            </Button>
          </>
        }
      >
        <ul className={styles.heroCards}>
          {TRAINING_DIRECTIONS.map((d, i) => (
            <li key={d.id}>
              <a href={`#${d.id}`} className={styles.heroCard}>
                <span className={styles.heroCardIcon}>
                  <Icon name={ICONS[i]} size={24} />
                </span>
                <span className={styles.heroCardNum}>0{i + 1}</span>
                <span className={styles.heroCardTitle}>{d.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </PageHero>

      {TRAINING_DIRECTIONS.map((d, i) => (
        <Section key={d.id} id={d.id} tone={i % 2 ? "cream" : "default"}>
          <div className={`${styles.split} reveal`}>
            <div>
              <p className={styles.kicker}>0{i + 1}</p>
              <h2 id={`${d.id}-title`} className={styles.splitTitle}>
                {d.title}
              </h2>
            </div>
            <div className={styles.splitBody}>
              <p className={styles.splitLead}>{d.lead}</p>
              <ul className={styles.steps}>
                {d.items.map((item) => (
                  <li key={item}>
                    <span className={styles.stepIcon}>
                      <Icon name="check" size={18} strokeWidth={2.4} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div>
                <Button to={requestHref(`${d.title} — заявка`)} variant="navy" icon={<Icon name="arrow" size={18} />}>
                  Оставить заявку
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
