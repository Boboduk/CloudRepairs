import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { BrowserFrame } from "../components/BrowserFrame";
import { CtaBand } from "../components/CtaBand";
import { SEO } from "../content/seo";
import { requestHref } from "../content/site";
import { CASES, HOME_HERO, HOME_STATS, MODULES, PARTNERS, PRODUCTS } from "../content/home";
import { INDUSTRIES } from "../content/product";
import { TRAINING_DIRECTIONS } from "../content/training";
import styles from "./Home.module.css";

export default function HomePage() {
  return (
    <>
      <Seo page={SEO["/"]} />
      <Hero />

      <Section id="products" tone="cream" eyebrow="Продукты и услуги" title="Всё для управления ТОиР — в одном месте">
        <ul className={styles.products}>
          {PRODUCTS.map((p) => {
            const body = (
              <>
                <div className={styles.productTop}>
                  <span className={styles.productNum}>{p.num}.</span>
                  {p.to && (
                    <span className={styles.productArrow}>
                      <Icon name="arrowUpRight" size={22} />
                    </span>
                  )}
                </div>
                <h3 className={styles.productTitle}>{p.title}</h3>
                <p className={styles.productText}>{p.text}</p>
              </>
            );
            return (
              <li key={p.num} className="reveal">
                {p.to ? (
                  <Link to={p.to} className={`${styles.product} ${p.num === "01" ? styles.productMain : ""}`}>
                    {body}
                  </Link>
                ) : (
                  <div className={styles.product}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        id="modules"
        tone="navy"
        eyebrow="Облачные ремонты"
        title="Возможности системы"
        aside={
          <Button to="/vnutyankaya-training/#funkcii" variant="outlineLight" icon={<Icon name="arrow" size={18} />}>
            Все функции
          </Button>
        }
      >
        <ol className={styles.modules}>
          {MODULES.map((m, i) => (
            <li key={m.title} className={`${styles.module} reveal`}>
              <span className={styles.moduleIcon}>
                <Icon name={m.icon} size={26} />
              </span>
              <div>
                <h3 className={styles.moduleTitle}>
                  <span className={styles.moduleNum}>{String(i + 1).padStart(2, "0")}</span>
                  {m.title}
                </h3>
                <p className={styles.moduleText}>{m.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="industries" eyebrow="Область применения" title="Мульти-отраслевое решение">
        <ul className={styles.industries}>
          {INDUSTRIES.map((ind) => (
            <li key={ind.title} className="reveal">
              <Link to="/vnutyankaya-training/#primenenie" className={styles.industry}>
                <span>{ind.title}</span>
                <Icon name="arrowUpRight" size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <TrainingTabs />

      <Section id="cases" eyebrow="Кейсы" title="Нам доверяют">
        <ul className={styles.cases}>
          {CASES.map((c) => (
            <li key={c} className={`${styles.case} reveal`}>
              <span className={styles.caseName}>{c}</span>
              <img src="/brand/symbol.png" alt="" aria-hidden="true" className={styles.caseMark} width={422} height={511} loading="lazy" />
            </li>
          ))}
        </ul>

        <div id="partners" className={styles.partnersHead}>
          <h2 id="partners-title" className={styles.partnersTitle}>
            Партнеры
          </h2>
        </div>
        <ul className={styles.partners} aria-labelledby="partners-title">
          {PARTNERS.map((p) => (
            <li key={p} className={`${styles.partner} reveal`}>
              {p}
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </>
  );
}

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} aria-hidden="true">
        <span className={styles.glowLime} />
        <span className={styles.glowSky} />
        <span className={`${styles.cloud} ${styles.cloud1}`} />
        <span className={`${styles.cloud} ${styles.cloud2}`} />
        <span className={`${styles.cloud} ${styles.cloud3}`} />
      </div>
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>{HOME_HERO.eyebrow}</p>
          <h1 className={styles.heroTitle}>
            Cloud<span>Repairs</span>
          </h1>
          <p className={styles.heroTagline}>{HOME_HERO.tagline}</p>
          <p className={styles.heroLead}>{HOME_HERO.lead}</p>
          <div className={styles.heroActions}>
            <Button to={requestHref("Попробовать CloudRepairs")} size="lg" icon={<Icon name="arrow" size={20} />}>
              Попробовать
            </Button>
            <Button to="/vnutyankaya-training/" variant="outlineLight" size="lg">
              О продукте
            </Button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <BrowserFrame src="/img/ui-equipment-catalog.png" alt="Интерфейс CloudRepairs: иерархический каталог оборудования" width={521} height={438} priority />
          <div className={`${styles.chip} ${styles.chip1}`}>
            <Icon name="shield" size={18} /> Реестр российского ПО
          </div>
          <div className={`${styles.chip} ${styles.chip2}`}>
            <Icon name="devices" size={18} /> Веб-браузер · Android · iOS
          </div>
        </div>
      </div>
      <div className="container">
        <dl className={styles.stats}>
          {HOME_STATS.map((s) => (
            <div key={s.label} className={styles.stat}>
              <dt className={styles.statValue}>{s.value}</dt>
              <dd className={styles.statLabel}>{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function TrainingTabs() {
  const [active, setActive] = useState(0);
  const dir = TRAINING_DIRECTIONS[active];
  return (
    <Section id="training" tone="cream" eyebrow="Обучение и консультация" title="Курсы, обучения, консультация, сопровождение">
      <div className={`${styles.training} reveal`}>
        <div className={styles.trainingTabs} role="tablist" aria-label="Направления">
          {TRAINING_DIRECTIONS.map((d, i) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              id={`tab-${d.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${d.id}`}
              className={`${styles.trainingTab} ${i === active ? styles.trainingTabActive : ""}`}
              onClick={() => setActive(i)}
            >
              <span className={styles.trainingTabNum}>0{i + 1}</span>
              {d.title}
            </button>
          ))}
        </div>
        <div className={styles.trainingPanel} role="tabpanel" id={`panel-${dir.id}`} aria-labelledby={`tab-${dir.id}`}>
          <h3 className={styles.trainingTitle}>{dir.title}</h3>
          <p className={styles.trainingLead}>{dir.lead}</p>
          <ul className={styles.trainingList}>
            {dir.items.map((it) => (
              <li key={it}>
                <Icon name="check" size={18} />
                {it}
              </li>
            ))}
          </ul>
          <div className={styles.trainingActions}>
            <Button to={`/obuchen/#${dir.id}`} variant="navy" icon={<Icon name="arrow" size={18} />}>
              Подробнее
            </Button>
            <Button to={requestHref(`${dir.title} — заявка`)} variant="outline">
              Оставить заявку
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
