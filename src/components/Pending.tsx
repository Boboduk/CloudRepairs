import type { PendingContent } from "../content/types";
import { Icon } from "./Icon";
import styles from "./Pending.module.css";

/**
 * Явная отметка места, где должен быть оригинальный материал CloudRepairs,
 * который не удалось получить при переносе. Удалите блок после заполнения.
 */
export function Pending({ items, compact = false }: { items: PendingContent[]; compact?: boolean }) {
  if (!items.length) return null;
  return (
    <aside className={`${styles.box} ${compact ? styles.compact : ""}`} aria-label="Материал требует заполнения">
      <Icon name="info" size={22} className={styles.icon} />
      <div>
        <p className={styles.title}>Требуется оригинальный материал</p>
        <ul className={styles.list}>
          {items.map((i) => (
            <li key={i.what}>
              {i.what}
              {!compact && (
                <>
                  {" "}
                  — <span className={styles.source}>источник: {i.source}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
