import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { Button } from "../components/Button";
import { Icon, type IconName } from "../components/Icon";
import { Section } from "../components/Section";
import { BrowserFrame } from "../components/BrowserFrame";
import { CtaBand } from "../components/CtaBand";
import { SmartLink } from "../components/SmartLink";
import { NewsCard } from "../components/NewsCard";
import { CasesGrid, PartnersCarousel } from "../components/Cases";
import { useContacts, usePage, useSite } from "../data/SiteData";
import styles from "./Home.module.css";

export default function HomePage() {
  const site = useSite();
  const page = usePage("home");
  const s = page.sections;

  const blocks: Record<string, ReactNode> = {
    products: <ProductsSection key="products" />,
    modules: (
      <Section
        key="modules"
        id="modules"
        tone="navy"
        eyebrow={s.modules.eyebrow}
        title={s.modules.title}
        aside={
          s.modules.buttonLabel ? (
            <Button to={s.modules.buttonHref || "/vnutyankaya-training/"} variant="outlineLight" icon={<Icon name="arrow" size={18} />}>
              {s.modules.buttonLabel}
            </Button>
          ) : undefined
        }
      >
        <ol className={styles.modules}>
          {s.modules.items.map((m, i) => (
            <li key={`${m.title}-${i}`} className={`${styles.module} reveal`}>
              <span className={styles.moduleIcon}>
                <Icon name={m.icon as IconName} size={26} />
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
    ),
    industries: (
      <Section key="industries" id="industries" eyebrow={s.industries.eyebrow} title={s.industries.title}>
        <ul className={styles.industries}>
          {site.pages.product.sections.application.industries.map((ind) => (
            <li key={ind.title} className="reveal">
              <Link to="/vnutyankaya-training/#primenenie" className={styles.industry}>
                <span>{ind.title}</span>
                <Icon name="arrowUpRight" size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    ),
    training: <TrainingTabs key="training" />,
    news: site.news.length ? (
      <Section
        key="news"
        id="news"
        tone="cream"
        eyebrow={s.news.eyebrow}
        title={s.news.title}
        aside={
          <Button to="/news/" variant="outline" icon={<Icon name="arrow" size={18} />}>
            {s.news.allLabel}
          </Button>
        }
      >
        <ul className={styles.newsGrid}>
          {site.news.slice(0, 3).map((n) => (
            <li key={n.id} className="reveal">
              <NewsCard item={n} />
            </li>
          ))}
        </ul>
      </Section>
    ) : null,
    cases: <CasesSection key="cases" />,
  };

  return (
    <>
      <Seo title={page.seoTitle} description={page.seoDescription} path="/" />
      <Hero />
      {page.order.map((key) => blocks[key] ?? null)}
      <CtaBand />
    </>
  );
}

function Hero() {
  const h = usePage("home").sections.hero;
  const { requestHref } = useContacts();
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
          {h.eyebrow && <p className={styles.heroEyebrow}>{h.eyebrow}</p>}
          <h1 className={styles.heroTitle}>
            {h.titleMain}
            <span>{h.titleAccent}</span>
          </h1>
          {h.tagline && <p className={styles.heroTagline}>{h.tagline}</p>}
          {h.lead && <p className={styles.heroLead}>{h.lead}</p>}
          <div className={styles.heroActions}>
            {h.primaryLabel && (
              <Button to={requestHref(`${h.primaryLabel} CloudRepairs`)} size="lg" icon={<Icon name="arrow" size={20} />}>
                {h.primaryLabel}
              </Button>
            )}
            {h.secondaryLabel && h.secondaryHref && (
              <Button to={h.secondaryHref} variant="outlineLight" size="lg">
                {h.secondaryLabel}
              </Button>
            )}
          </div>
        </div>
        {h.image && (
          <div className={styles.heroVisual}>
            <BrowserFrame src={h.image} alt={h.imageAlt} priority />
            {h.chips[0] && (
              <div className={`${styles.chip} ${styles.chip1}`}>
                <Icon name="shield" size={18} /> {h.chips[0]}
              </div>
            )}
            {h.chips[1] && (
              <div className={`${styles.chip} ${styles.chip2}`}>
                <Icon name="devices" size={18} /> {h.chips[1]}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="container">
        {h.stats.length > 0 && (
          <dl className={styles.stats}>
            {h.stats.map((st, i) => (
              <div key={i} className={styles.stat}>
                <dt className={styles.statValue}>{st.value}</dt>
                <dd className={styles.statLabel}>{st.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

function ProductsSection() {
  const site = useSite();
  const s = usePage("home").sections.products;
  return (
    <Section id="products" tone="cream" eyebrow={s.eyebrow} title={s.title}>
      <ul className={styles.products}>
        {site.products.map((p, i) => {
          const body = (
            <>
              <div className={styles.productTop}>
                <span className={styles.productNum}>{String(i + 1).padStart(2, "0")}.</span>
                {p.href && (
                  <span className={styles.productArrow}>
                    <Icon name="arrowUpRight" size={22} />
                  </span>
                )}
              </div>
              {p.image && <img className={styles.productImage} src={p.image.url} alt={p.image.alt} loading="lazy" width={p.image.width ?? undefined} height={p.image.height ?? undefined} />}
              <h3 className={styles.productTitle}>{p.title}</h3>
              <p className={styles.productText}>{p.excerpt}</p>
              {p.href && p.linkLabel && <span className={styles.productLink}>{p.linkLabel}</span>}
            </>
          );
          const cls = `${styles.product} ${i === 0 ? styles.productMain : ""}`;
          return (
            <li key={p.id} className="reveal">
              {p.href ? (
                <SmartLink to={p.href} className={cls}>
                  {body}
                </SmartLink>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function CasesSection() {
  const site = useSite();
  const s = usePage("home").sections.cases;
  if (!site.cases.length && !site.partners.length) return null;
  return (
    <Section
      id="cases"
      eyebrow={s.eyebrow}
      title={s.title}
      aside={
        site.cases.length > 0 ? (
          <Button to="/cases/" variant="outline" icon={<Icon name="arrow" size={18} />}>
            {s.allLabel || "Все кейсы"}
          </Button>
        ) : undefined
      }
    >
      <CasesGrid cases={site.cases.slice(0, 3)} />

      {site.partners.length > 0 && (
        <>
          <div id="partners" className={styles.partnersHead}>
            <h2 id="partners-title" className={styles.partnersTitle}>
              {s.partnersTitle}
            </h2>
          </div>
          <div className="reveal">
            <PartnersCarousel partners={site.partners} label={s.partnersTitle || "Партнеры"} />
          </div>
        </>
      )}
    </Section>
  );
}

function TrainingTabs() {
  const [active, setActive] = useState(0);
  const site = useSite();
  const s = usePage("home").sections.training;
  const { requestHref } = useContacts();
  const dirs = site.pages.training.sections.directions.items;
  if (!dirs.length) return null;
  const dir = dirs[Math.min(active, dirs.length - 1)];
  return (
    <Section id="training" tone="cream" eyebrow={s.eyebrow} title={s.title}>
      <div className={`${styles.training} reveal`}>
        <div className={styles.trainingTabs} role="tablist" aria-label="Направления">
          {dirs.map((d, i) => (
            <button
              key={`${d.id}-${i}`}
              type="button"
              role="tab"
              id={`tab-${i}`}
              aria-selected={d === dir}
              aria-controls="training-panel"
              className={`${styles.trainingTab} ${d === dir ? styles.trainingTabActive : ""}`}
              onClick={() => setActive(i)}
            >
              <span className={styles.trainingTabNum}>{String(i + 1).padStart(2, "0")}</span>
              {d.title}
            </button>
          ))}
        </div>
        <div className={styles.trainingPanel} role="tabpanel" id="training-panel" aria-labelledby={`tab-${dirs.indexOf(dir)}`}>
          <h3 className={styles.trainingTitle}>{dir.title}</h3>
          {dir.lead && <p className={styles.trainingLead}>{dir.lead}</p>}
          {dir.items.length > 0 && (
            <ul className={styles.trainingList}>
              {dir.items.map((it) => (
                <li key={it}>
                  <Icon name="check" size={18} />
                  {it}
                </li>
              ))}
            </ul>
          )}
          <div className={styles.trainingActions}>
            <Button to={`/obuchen/${dir.id ? `#${dir.id}` : ""}`} variant="navy" icon={<Icon name="arrow" size={18} />}>
              {s.moreLabel}
            </Button>
            <Button to={requestHref(`${dir.title} — заявка`)} variant="outline">
              {s.requestLabel}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
