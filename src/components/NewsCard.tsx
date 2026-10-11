import { Link } from "react-router-dom";
import type { NewsListItem } from "../../shared/types";
import { detailPath } from "../../shared/routes";
import { Icon } from "./Icon";
import styles from "./NewsCard.module.css";

export function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Moscow" });
}

/** Карточка новости — в стиле карточек «Продукты и услуги» */
export function NewsCard({ item }: { item: NewsListItem }) {
  return (
    <Link to={detailPath("news", item.slug)} className={styles.card}>
      <div className={styles.media}>
        {item.cover ? (
          <img src={item.cover.url} alt={item.cover.alt || item.title} loading="lazy" width={item.cover.width ?? undefined} height={item.cover.height ?? undefined} />
        ) : (
          <img src="/brand/symbol.png" alt="" aria-hidden="true" className={styles.placeholder} />
        )}
      </div>
      <div className={styles.body}>
        {item.publishedAt && <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>}
        <h3 className={styles.title}>{item.title}</h3>
        {item.excerpt && <p className={styles.excerpt}>{item.excerpt}</p>}
        <span className={styles.more}>
          Прочитать <Icon name="arrow" size={18} />
        </span>
      </div>
    </Link>
  );
}
