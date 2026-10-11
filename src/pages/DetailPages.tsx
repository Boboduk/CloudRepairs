import { useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Section } from "../components/Section";
import { RichText } from "../components/RichText";
import { CtaBand } from "../components/CtaBand";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { formatDate } from "../components/NewsCard";
import { SmartLink } from "../components/SmartLink";
import { useDetail, useSite } from "../data/SiteData";
import { detailPath } from "../../shared/routes";
import NotFoundPage from "./NotFoundPage";
import styles from "./pages.module.css";

function Loading() {
  return (
    <section className={styles.loading} aria-busy="true">
      <div className="container">Загрузка…</div>
    </section>
  );
}

export function NewsPage() {
  const { slug = "" } = useParams();
  const { item, loading } = useDetail("news", slug);
  const site = useSite();
  if (loading) return <Loading />;
  if (!item) return <NotFoundPage />;
  const others = site.news.filter((n) => n.id !== item.id).slice(0, 3);
  return (
    <>
      <Seo title={item.seoTitle || `${item.title} — CloudRepairs`} description={item.seoDescription || item.excerpt} path={detailPath("news", item.slug)} />
      <PageHero breadcrumb="Новости" eyebrow={item.publishedAt ? formatDate(item.publishedAt) : "Новости"} title={item.title} lead={item.excerpt} />
      <Section>
        <article className={styles.article}>
          {item.cover && <img className={styles.articleCover} src={item.cover.url} alt={item.cover.alt || item.title} width={item.cover.width ?? undefined} height={item.cover.height ?? undefined} />}
          <RichText html={item.body} />
          <div className={styles.articleBack}>
            <Button to="/news/" variant="outline" icon={<Icon name="arrow" size={18} />}>
              Все новости
            </Button>
          </div>
        </article>
        {others.length > 0 && (
          <div className={styles.related}>
            <h2 className={styles.relatedTitle}>Другие новости</h2>
            <ul className={styles.relatedList}>
              {others.map((n) => (
                <li key={n.id}>
                  <SmartLink to={detailPath("news", n.slug)}>{n.title}</SmartLink>
                  {n.publishedAt && <span>{formatDate(n.publishedAt)}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
      <CtaBand />
    </>
  );
}

export function CasePage() {
  const { slug = "" } = useParams();
  const { item, loading } = useDetail("cases", slug);
  if (loading) return <Loading />;
  if (!item) return <NotFoundPage />;
  return (
    <>
      <Seo title={item.seoTitle || `${item.title} — кейс CloudRepairs`} description={item.seoDescription || item.excerpt} path={detailPath("cases", item.slug)} />
      <PageHero breadcrumb="Кейсы" eyebrow={item.client || item.partner?.name || "Кейс"} title={item.title} lead={item.excerpt} />
      <Section>
        <article className={styles.article}>
          {item.cover && <img className={styles.articleCover} src={item.cover.url} alt={item.cover.alt || item.title} />}
          <RichText html={item.body} />
          {item.images.length > 0 && (
            <ul className={styles.gallery}>
              {item.images.map((im) => (
                <li key={im.id}>
                  <a href={im.url} target="_blank" rel="noopener noreferrer">
                    <img src={im.url} alt={im.alt || item.title} loading="lazy" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {item.links.length > 0 && (
            <div className={styles.links}>
              <h2 className={styles.relatedTitle}>Материалы</h2>
              <ul>
                {item.links.map((l, i) => (
                  <li key={i}>
                    <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {l.label} <Icon name="arrowUpRight" size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.partner && (
            <p className={styles.partnerNote}>
              Партнер: {item.partner.url ? <a href={item.partner.url} target="_blank" rel="noopener noreferrer">{item.partner.name}</a> : item.partner.name}
            </p>
          )}
          <div className={styles.articleBack}>
            <Button to="/#cases" variant="outline" icon={<Icon name="arrow" size={18} />}>
              Все кейсы
            </Button>
          </div>
        </article>
      </Section>
      <CtaBand />
    </>
  );
}

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { item, loading } = useDetail("products", slug);
  if (loading) return <Loading />;
  if (!item) return <NotFoundPage />;
  return (
    <>
      <Seo title={item.seoTitle || `${item.title} — CloudRepairs`} description={item.seoDescription || item.excerpt} path={detailPath("products", item.slug)} />
      <PageHero breadcrumb="Продукты" eyebrow="Продукты и услуги" title={item.title} lead={item.excerpt} />
      <Section>
        <article className={styles.article}>
          {item.image && <img className={styles.articleCover} src={item.image.url} alt={item.image.alt || item.title} />}
          <RichText html={item.body} />
          <div className={styles.articleBack}>
            <Button to="/#products" variant="outline" icon={<Icon name="arrow" size={18} />}>
              Все продукты и услуги
            </Button>
          </div>
        </article>
      </Section>
      <CtaBand />
    </>
  );
}
