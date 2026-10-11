import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { HeroVisual } from "../components/HeroVisual";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { FeatureGrid } from "../components/FeatureGrid";
import { Pending } from "../components/Pending";
import { ContactsBlock } from "../components/ContactsBlock";
import { SEO } from "../content/seo";
import { LOGIN_URL } from "../content/site";
import { HOME_FEATURES, HOME_HERO, HOME_PENDING, HOME_TRAINING } from "../content/home";
import styles from "./pages.module.css";

export default function HomePage() {
  return (
    <>
      <Seo page={SEO["/"]} />
      <PageHero
        size="home"
        eyebrow={HOME_HERO.eyebrow}
        title={HOME_HERO.title}
        lead={HOME_HERO.lead}
        visual={<HeroVisual />}
        actions={
          <>
            <Button to={LOGIN_URL} size="lg" icon={<Icon name="arrow" size={20} />}>
              Войти в систему
            </Button>
            <Button to="/obuchen/" variant="secondary" size="lg">
              {HOME_TRAINING.title}
            </Button>
          </>
        }
      />

      <Section id="features" eyebrow="Возможности системы" title="Планирование и управление ТОиР в одной системе">
        <FeatureGrid items={HOME_FEATURES} />
      </Section>

      <Section id="training" tone="soft">
        <div className={styles.split}>
          <div>
            <p className={styles.kicker}>Направление</p>
            <h2 id="training-title" className={styles.splitTitle}>
              {HOME_TRAINING.title}
            </h2>
          </div>
          <div className={styles.splitBody}>
            <ul className={styles.tags}>
              {HOME_TRAINING.text
                .replace(/\.$/, "")
                .split(", ")
                .map((t) => (
                  <li key={t}>{t[0].toUpperCase() + t.slice(1)}</li>
                ))}
            </ul>
            <div className={styles.row}>
              <Button to="/obuchen/" icon={<Icon name="arrow" size={18} />}>
                Подробнее об обучении
              </Button>
              <Button to="/vnutyankaya-training/" variant="ghost">
                Внутреннее обучение
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="pending">
        <Pending items={HOME_PENDING} />
      </Section>

      <ContactsBlock />
    </>
  );
}
