import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Section } from "../components/Section";
import { SubNav } from "../components/SubNav";
import { BrowserFrame } from "../components/BrowserFrame";
import { CtaBand } from "../components/CtaBand";
import { useContacts, usePage } from "../data/SiteData";
import styles from "./Product.module.css";

function CheckList({ items, tone = "default" }: { items: string[]; tone?: "default" | "light" }) {
  return (
    <ul className={`${styles.checks} ${tone === "light" ? styles.checksLight : ""}`}>
      {items.map((i, idx) => (
        <li key={`${idx}-${i}`}>
          <span className={styles.checkIcon}>
            <Icon name="check" size={16} strokeWidth={2.4} />
          </span>
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

const TAB_IDS = ["funkcii", "harakteristiki", "primenenie", "vygody", "ceny"] as const;

export default function ProductPage() {
  const page = usePage("product");
  const s = page.sections;
  const { requestHref } = useContacts();
  const tabs = TAB_IDS.map((id) => ({ id, label: s.tabs[id] || id }));

  return (
    <>
      <Seo title={page.seoTitle} description={page.seoDescription} path="/vnutyankaya-training/" />
      <PageHero
        breadcrumb="Продукт"
        eyebrow={s.hero.eyebrow}
        title={s.hero.title}
        lead={s.hero.lead}
        actions={
          <>
            <Button to={requestHref("Заявка: CloudRepairs")} size="lg" icon={<Icon name="arrow" size={20} />}>
              {s.pricing.buttonLabel || "Оставить заявку"}
            </Button>
            <Button to="#ceny" variant="outlineLight" size="lg">
              {s.tabs.ceny}
            </Button>
          </>
        }
        aside={s.hero.image ? <BrowserFrame src={s.hero.image} alt={s.hero.imageAlt} priority /> : undefined}
      />
      <SubNav items={tabs} label="Разделы страницы продукта" />

      {/* ---------- Функции ---------- */}
      <Section id="funkcii" eyebrow={s.tabs.funkcii} title={s.imagine.title}>
        <div className={styles.imagine}>
          <div className={`${styles.imagineCases} reveal`}>
            <ul>
              {s.imagine.cases.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className={`${styles.imagineNeeds} reveal`}>
            <p className={styles.imagineNeedsTitle}>{s.imagine.needsTitle}</p>
            <CheckList items={s.imagine.needs} />
            {s.imagine.field && <p className={styles.imagineField}>{s.imagine.field}</p>}
          </div>
        </div>
        {s.imagine.result && <p className={`${styles.result} reveal`}>{s.imagine.result}</p>}

        {s.solution.paragraphs.length > 0 && (
          <div className={`${styles.solution} reveal`}>
            <img src="/brand/symbol.png" alt="" aria-hidden="true" className={styles.solutionMark} width={422} height={511} loading="lazy" />
            <p className={styles.solutionLead}>{s.solution.paragraphs[0]}</p>
            <div className={styles.solutionGrid}>
              {s.solution.paragraphs.slice(1).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {s.solution.note && <p className={styles.solutionNote}>{s.solution.note}</p>}
          </div>
        )}

        <div className={styles.functions}>
          {s.functions.items.map((f, i) => (
            <article key={`${f.title}-${i}`} className={`${styles.function} ${f.image ? styles.functionWide : ""} reveal`}>
              <div className={styles.functionHead}>
                <span className={styles.functionNum}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.functionTitle}>{f.title}</h3>
              </div>
              <div className={styles.functionBody}>
                {f.text.map((t, j) => (
                  <p key={j}>{t}</p>
                ))}
              </div>
              {f.image && (
                <div className={styles.functionImage}>
                  <BrowserFrame src={f.image} alt={f.imageAlt || f.title} />
                </div>
              )}
            </article>
          ))}
        </div>

        <div className={`${styles.potential} reveal`}>
          <h3 className={styles.blockTitle}>{s.potential.title}</h3>
          {s.potential.intro && <p className={styles.potentialIntro}>{s.potential.intro}</p>}
          {s.potential.notes.length > 0 && (
            <ul className={styles.potentialNotes}>
              {s.potential.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
          <div className={styles.potentialGrid}>
            {s.potential.directions.map((d, i) => (
              <div key={i} className={styles.potentialCard}>
                <h4>{d.title}</h4>
                <ul>
                  {d.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------- Характеристики ---------- */}
      <Section id="harakteristiki" tone="cream" eyebrow={s.tabs.harakteristiki} title={s.specs.title}>
        <div className={styles.specsLayout}>
          <div className={`${styles.card} reveal`}>
            <h3 className={styles.cardTitle}>{s.specs.componentsTitle}</h3>
            <CheckList items={s.specs.components} />
          </div>
          <div className={styles.specsCol}>
            <div className={`${styles.card} reveal`}>
              <h3 className={styles.cardTitle}>{s.specs.specsTitle}</h3>
              <dl className={styles.specs}>
                {s.specs.specs.map((row, i) => (
                  <div key={i} className={styles.specRow}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={`${styles.card} reveal`}>
              <h3 className={styles.cardTitle}>{s.specs.stackTitle}</h3>
              <div className={styles.stack}>
                {s.specs.stack.map((g, i) => (
                  <div key={i}>
                    <p className={styles.stackTitle}>{g.title}</p>
                    <ul className={styles.tags}>
                      {g.items.map((t, j) => (
                        <li key={j}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {s.specs.extra.length > 0 && (
          <div className={`${styles.card} ${styles.extra} reveal`}>
            <h3 className={styles.cardTitle}>{s.specs.extraTitle}</h3>
            <ul className={styles.tags}>
              {s.specs.extra.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* ---------- Область применения ---------- */}
      <Section id="primenenie" eyebrow={s.tabs.primenenie} title={s.application.title}>
        <ul className={`${styles.areas} reveal`}>
          {s.application.areas.map((a, i) => (
            <li key={i}>
              {a.href ? (
                <a href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel={a.href.startsWith("http") ? "noopener noreferrer" : undefined}>
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
          {s.application.industries.map((ind, i) => (
            <li key={i} className={`${styles.industry} reveal`}>
              <span className={styles.industryNum}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.industryTitle}>{ind.title}</h3>
              <ul>
                {ind.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Выгоды пользователя ---------- */}
      <Section id="vygody" tone="navy" eyebrow={s.tabs.vygody} title={s.benefits.title} lead={s.benefits.intro}>
        <div className={styles.pillars}>
          {s.benefits.pillars.map((p, i) => (
            <div key={i} className={`${styles.pillar} reveal`}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        <div className={styles.econ}>
          <div className="reveal">
            <h3 className={styles.econTitle}>{s.benefits.econTitle}</h3>
            <dl className={styles.econStats}>
              {s.benefits.econ.map((e, i) => (
                <div key={i}>
                  <dt>{e.value}</dt>
                  <dd>{e.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="reveal">
            <h3 className={styles.econTitle}>{s.benefits.orgTitle}</h3>
            <CheckList items={s.benefits.org} tone="light" />
          </div>
        </div>
        {s.benefits.keyTool && <p className={`${styles.keyTool} reveal`}>{s.benefits.keyTool}</p>}
      </Section>

      {s.benefits.lists.length > 0 && (
        <Section tone="cream">
          <div className={styles.lists}>
            {s.benefits.lists.map((l, i) => (
              <div key={i} className={`${styles.card} reveal`}>
                <h3 className={styles.cardTitle}>{l.title}</h3>
                <CheckList items={l.items} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------- Цены, тарифы ---------- */}
      <Section id="ceny" eyebrow={s.tabs.ceny} title={s.pricing.title}>
        <div className={styles.pricing}>
          {s.pricing.blocks.map((p, i) => (
            <article key={i} className={`${styles.priceBlock} reveal`}>
              <div className={styles.priceHead}>
                <span className={styles.priceNum}>{String(i + 1).padStart(2, "0")}.</span>
                <div>
                  <h3 className={styles.priceTitle}>{p.title}</h3>
                  {p.lead && <p className={styles.priceLead}>{p.lead}</p>}
                </div>
              </div>
              {p.plans.length > 0 && (
                <ul className={styles.plans}>
                  {p.plans.map((pl, j) => (
                    <li key={j} className={styles.plan}>
                      <p className={styles.planName}>{pl.name}</p>
                      {pl.price && <p className={styles.planPrice}>{pl.price}</p>}
                      {pl.note && <p className={styles.planNote}>{pl.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.priceAction}>
                <Button to={requestHref(`Тариф: ${p.title}`)} variant={p.plans.length ? "lime" : "outline"} icon={<Icon name="arrow" size={18} />}>
                  {s.pricing.buttonLabel || "Оставить заявку"}
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
