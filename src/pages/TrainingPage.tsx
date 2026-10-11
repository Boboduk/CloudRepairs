import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { Pending } from "../components/Pending";
import { ContactsBlock } from "../components/ContactsBlock";
import { SEO } from "../content/seo";
import { TRAINING_HERO, TRAINING_PENDING, TRAINING_SECTIONS } from "../content/training";
import styles from "./pages.module.css";

export default function TrainingPage() {
  return (
    <>
      <Seo page={SEO["/obuchen/"]} />
      <PageHero
        breadcrumb="Обучение"
        title={TRAINING_HERO.title}
        lead={TRAINING_HERO.lead}
        actions={
          <>
            {TRAINING_SECTIONS.map((s) => (
              <Button key={s.id} to={`#${s.id}`} variant="secondary">
                {s.title}
              </Button>
            ))}
            <Button to="#contacts">Связаться</Button>
          </>
        }
      />

      {TRAINING_SECTIONS.map((s, i) => (
        <Section key={s.id} id={s.id} tone={i % 2 ? "soft" : "default"}>
          <div className={styles.split}>
            <div>
              <p className={styles.kicker}>{String(i + 1).padStart(2, "0")}</p>
              <h2 id={`${s.id}-title`} className={styles.splitTitle}>
                {s.title}
              </h2>
            </div>
            <div className={styles.splitBody}>
              <ol className={styles.steps}>
                {s.items.map((item) => (
                  <li key={item}>
                    <span className={styles.stepIcon}>
                      <Icon name="check" size={18} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
              {s.pending && <Pending items={[s.pending]} compact />}
            </div>
          </div>
        </Section>
      ))}

      <Section id="materials">
        <Pending items={TRAINING_PENDING} />
      </Section>

      <ContactsBlock />
    </>
  );
}
