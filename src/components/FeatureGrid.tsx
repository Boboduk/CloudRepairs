import type { Feature } from "../content/types";
import { Icon } from "./Icon";
import styles from "./FeatureGrid.module.css";

/** Сетка возможностей. Карточки без полученного оригинального текста помечаются. */
export function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((f, i) => (
        <li key={f.title} className={`${styles.item} ${!f.text ? styles.pending : ""}`}>
          <div className={styles.top}>
            <span className={styles.icon}>
              <Icon name={f.icon} />
            </span>
            <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
          </div>
          <h3 className={styles.title}>{f.title}</h3>
          {f.text ? (
            <p className={styles.text}>{f.text}</p>
          ) : (
            <p className={styles.missing}>Описание с оригинального сайта не получено — требуется заполнить.</p>
          )}
          {f.list && (
            <ul className={styles.list}>
              {f.list.map((l) => (
                <li key={l}>
                  <Icon name="check" size={18} />
                  {l}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
