import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { SubNav } from "../components/SubNav";
import { BrowserFrame } from "../components/BrowserFrame";
import { CtaBand } from "../components/CtaBand";
import { SEO } from "../content/seo";
import { requestHref } from "../content/site";
import {
  ADVANTAGES_VS_SUPPLIERS,
  ALLOWS,
  APPLICATION_AREAS,
  BENEFITS_INTRO,
  BENEFIT_PILLARS,
  ECONOMIC_BENEFITS,
  EXTRA_FUNCTIONS,
  FSM_NOTE,
  FUNCTIONS,
  IMAGINE,
  INDUSTRIES,
  KEY_TOOL,
  ORG_BENEFITS,
  PLATFORM_COMPONENTS,
  PLUSES,
  POTENTIAL,
  PRICING,
  PRODUCT_HERO,
  PRODUCT_TABS,
  SOLUTION,
  SPECS,
  TECH_STACK,
  VS_COMPETITORS,
} from "../content/product";
import styles from "./Product.module.css";

function CheckList({ items, tone = "default" }: { items: string[]; tone?: "default" | "light" }) {
  return (
    <ul className={`${styles.checks} ${tone === "light" ? styles.checksLight : ""}`}>
      {items.map((i) => (
        <li key={i}>
          <span className={styles.checkIcon}>
            <Icon name="check" size={16} strokeWidth={2.4} />
          </span>
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProductPage() {
  return (
    <>
      <Seo page={SEO["/vnutyankaya-training/"]} />
      <PageHero
        breadcrumb="Продукт"
        eyebrow={PRODUCT_HERO.eyebrow}
        title={PRODUCT_HERO.title}
        lead={PRODUCT_HERO.lead}
        actions={
          <>
            <Button to={requestHref("Заявка: CloudRepairs")} size="lg" icon={<Icon name="arrow" size={20} />}>
              Оставить заявку
            </Button>
            <Button to="#ceny" variant="outlineLight" size="lg">
              Цены, тарифы
            </Button>
          </>
        }
        aside={<BrowserFrame src="/img/ui-equipment-catalog.png" alt="Интерфейс CloudRepairs: иерархический каталог оборудования" width={521} height={438} priority />}
      />
      <SubNav items={PRODUCT_TABS} label="Разделы страницы продукта" />

      {/* ---------- Функции ---------- */}
      <Section id="funkcii" eyebrow="Функции" title="Представьте">
        <div className={styles.imagine}>
          <div className={`${styles.imagineCases} reveal`}>
            <ul>
              {IMAGINE.cases.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className={`${styles.imagineNeeds} reveal`}>
            <p className={styles.imagineNeedsTitle}>{IMAGINE.needsTitle}</p>
            <CheckList items={IMAGINE.needs} />
            <p className={styles.imagineField}>{IMAGINE.field}</p>
          </div>
        </div>
        <p className={`${styles.result} reveal`}>{IMAGINE.result}</p>

        <div className={`${styles.solution} reveal`}>
          <img src="/brand/symbol.png" alt="" aria-hidden="true" className={styles.solutionMark} width={422} height={511} loading="lazy" />
          <p className={styles.solutionLead}>{SOLUTION[0]}</p>
          <div className={styles.solutionGrid}>
            {SOLUTION.slice(1).map((s) => (
              <p key={s}>{s}</p>
            ))}
          </div>
          <p className={styles.solutionNote}>{FSM_NOTE}</p>
        </div>

        <div className={styles.functions}>
          {FUNCTIONS.map((f, i) => (
            <article key={f.title} className={`${styles.function} ${f.image ? styles.functionWide : ""} reveal`}>
              <div className={styles.functionHead}>
                <span className={styles.functionNum}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.functionTitle}>{f.title}</h3>
              </div>
              <div className={styles.functionBody}>
                {f.text.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              {f.image && (
                <div className={styles.functionImage}>
                  <BrowserFrame src={f.image.src} alt={f.image.alt} width={f.image.width} height={f.image.height} />
                </div>
              )}
            </article>
          ))}
        </div>

        <div className={`${styles.potential} reveal`}>
          <h3 className={styles.blockTitle}>{POTENTIAL.title}</h3>
          <p className={styles.potentialIntro}>{POTENTIAL.intro}</p>
          <ul className={styles.potentialNotes}>
            {POTENTIAL.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <div className={styles.potentialGrid}>
            {POTENTIAL.directions.map((d) => (
              <div key={d.title} className={styles.potentialCard}>
                <h4>{d.title}</h4>
                <ul>
                  {d.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------- Характеристики ---------- */}
      <Section id="harakteristiki" tone="cream" eyebrow="Характеристики" title="Платформа и технологии">
        <div className={styles.specsLayout}>
          <div className={`${styles.card} reveal`}>
            <h3 className={styles.cardTitle}>Компоненты платформы CloudRepairs включают:</h3>
            <CheckList items={PLATFORM_COMPONENTS} />
          </div>
          <div className={styles.specsCol}>
            <div className={`${styles.card} reveal`}>
              <h3 className={styles.cardTitle}>Основное</h3>
              <dl className={styles.specs}>
                {SPECS.map((s) => (
                  <div key={s.label} className={styles.specRow}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={`${styles.card} reveal`}>
              <h3 className={styles.cardTitle}>Технологический стек</h3>
              <div className={styles.stack}>
                {TECH_STACK.map((g) => (
                  <div key={g.title}>
                    <p className={styles.stackTitle}>{g.title}</p>
                    <ul className={styles.tags}>
                      {g.items.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.extra} reveal`}>
          <h3 className={styles.cardTitle}>Дополнительные функции</h3>
          <ul className={styles.tags}>
            {EXTRA_FUNCTIONS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------- Область применения ---------- */}
      <Section id="primenenie" eyebrow="Область применения" title={APPLICATION_AREAS.title}>
        <ul className={`${styles.areas} reveal`}>
          {APPLICATION_AREAS.items.map((a) => (
            <li key={a.label}>
              {a.href ? (
                <a href={a.href} target="_blank" rel="noopener noreferrer">
                  {a.label}
                  <Icon name="arrowUpRight" size={16} />
                </a>
              ) : (
                <span>{a.label}</span>
              )}
            </li>
          ))}
        </ul>
        <ul className={styles.industries}>
          {INDUSTRIES.map((ind, i) => (
            <li key={ind.title} className={`${styles.industry} reveal`}>
              <span className={styles.industryNum}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.industryTitle}>{ind.title}</h3>
              <ul>
                {ind.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Выгоды пользователя ---------- */}
      <Section id="vygody" tone="navy" eyebrow="Выгоды пользователя" title="Эффект для бизнеса" lead={BENEFITS_INTRO}>
        <div className={styles.pillars}>
          {BENEFIT_PILLARS.map((p) => (
            <div key={p.title} className={`${styles.pillar} reveal`}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        <div className={styles.econ}>
          <div className="reveal">
            <h3 className={styles.econTitle}>Система позволяет получить экономические выгоды:</h3>
            <dl className={styles.econStats}>
              {ECONOMIC_BENEFITS.map((e) => (
                <div key={e.label}>
                  <dt>{e.value}</dt>
                  <dd>{e.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="reveal">
            <h3 className={styles.econTitle}>Система позволяет получить организационные выгоды:</h3>
            <CheckList items={ORG_BENEFITS} tone="light" />
          </div>
        </div>
        <p className={`${styles.keyTool} reveal`}>{KEY_TOOL}</p>
      </Section>

      <Section tone="cream">
        <div className={styles.lists}>
          {[
            { title: "Преимущества перед другими поставщиками", items: ADVANTAGES_VS_SUPPLIERS },
            { title: "Плюсы ИС «Облачные ремонты»", items: PLUSES },
            { title: "Применение CloudRepairs позволит", items: ALLOWS },
            { title: "Преимущества перед конкурентами", items: VS_COMPETITORS },
          ].map((l) => (
            <div key={l.title} className={`${styles.card} reveal`}>
              <h3 className={styles.cardTitle}>{l.title}</h3>
              <CheckList items={l.items} />
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- Цены, тарифы ---------- */}
      <Section id="ceny" eyebrow="Цены, тарифы" title="Тарифы и условия">
        <div className={styles.pricing}>
          {PRICING.map((p) => (
            <article key={p.num} className={`${styles.priceBlock} reveal`}>
              <div className={styles.priceHead}>
                <span className={styles.priceNum}>{p.num}.</span>
                <div>
                  <h3 className={styles.priceTitle}>{p.title}</h3>
                  {p.lead && <p className={styles.priceLead}>{p.lead}</p>}
                </div>
              </div>
              {p.plans.length > 0 && (
                <ul className={styles.plans}>
                  {p.plans.map((pl) => (
                    <li key={pl.name} className={styles.plan}>
                      <p className={styles.planName}>{pl.name}</p>
                      {pl.price && <p className={styles.planPrice}>{pl.price}</p>}
                      {pl.note && <p className={styles.planNote}>{pl.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.priceAction}>
                <Button to={requestHref(`Тариф: ${p.title}`)} variant={p.plans.length ? "lime" : "outline"} icon={<Icon name="arrow" size={18} />}>
                  Оставить заявку
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <CtaBand subject="Вопрос о CloudRepairs" />
    </>
  );
}
