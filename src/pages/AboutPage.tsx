import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { CtaBand } from "../components/CtaBand";
import { SEO } from "../content/seo";
import { ABOUT_HERO, ABOUT_PRINCIPLES, ABOUT_TEAM } from "../content/about";
import { CASES, PARTNERS } from "../content/home";
import { SOLUTION } from "../content/product";
import styles from "./pages.module.css";

const ICONS = ["users", "spark", "layers", "shield"] as const;

export default function AboutPage() {
  return (
    <>
      <Seo page={SEO["/about/"]} />
      <PageHero
        breadcrumb="О нас"
        eyebrow={ABOUT_HERO.eyebrow}
        title={ABOUT_HERO.title}
        lead={ABOUT_HERO.lead}
        actions={
          <Button to="/vnutyankaya-training/" size="lg" icon={<Icon name="arrow" size={20} />}>
            О продукте
          </Button>
        }
      />

      <Section id="principles" eyebrow="Принципы" title="Как устроен CloudRepairs">
        <ul className={styles.principles}>
          {ABOUT_PRINCIPLES.map((p, i) => (
            <li key={p.title} className={`${styles.principle} reveal`}>
              <span className={styles.principleIcon}>
                <Icon name={ICONS[i]} size={26} />
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
        <p className={`${styles.quote} reveal`}>{SOLUTION[3]}</p>
      </Section>

      <Section id="team" tone="cream" eyebrow={ABOUT_TEAM.title} title={ABOUT_TEAM.text} lead={ABOUT_TEAM.support}>
        <div className={`${styles.row} reveal`}>
          <Button to="/obuchen/" variant="navy" icon={<Icon name="arrow" size={18} />}>
            Обучение и консультация
          </Button>
          <Button to="/vnutyankaya-training/#ceny" variant="outline">
            Цены, тарифы
          </Button>
        </div>
      </Section>

      <Section id="cases-partners" eyebrow="Кейсы и партнеры" title="С кем мы работаем">
        <div className={styles.logoGroups}>
          <div className="reveal">
            <p className={styles.groupLabel}>Кейсы</p>
            <ul className={styles.nameList}>
              {CASES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <p className={styles.groupLabel}>Партнеры</p>
            <ul className={styles.nameList}>
              {PARTNERS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className={styles.more}>
          <Link to="/#cases">Кейсы на главной странице →</Link>
        </p>
      </Section>

      <CtaBand />
    </>
  );
}
