import styles from "./HeroVisual.module.css";

/**
 * Декоративная схема интерфейса (каталог оборудования + диаграмма Ганта).
 * Не содержит данных — место для оригинальных скриншотов системы
 * (замените на <img>, когда будут получены материалы с cloudrepairs.ru).
 */
export function HeroVisual() {
  const bars = [
    { l: 4, w: 34, c: "p" },
    { l: 22, w: 30, c: "a" },
    { l: 12, w: 44, c: "p" },
    { l: 48, w: 26, c: "s" },
    { l: 30, w: 38, c: "p" },
    { l: 60, w: 30, c: "a" },
  ];
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.toolbar}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.body}>
        <div className={styles.tree}>
          {[0, 1, 2, 2, 1, 2, 2, 0, 1].map((lvl, i) => (
            <div key={i} className={styles.node} style={{ paddingLeft: lvl * 14 }}>
              <i className={lvl === 0 ? styles.dotRoot : styles.dot} />
              <b style={{ width: `${70 - lvl * 14}%` }} />
            </div>
          ))}
        </div>
        <div className={styles.gantt}>
          <div className={styles.scale}>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          {bars.map((b, i) => (
            <div key={i} className={styles.row}>
              <span className={`${styles.bar} ${styles[b.c]}`} style={{ left: `${b.l}%`, width: `${b.w}%` }} />
            </div>
          ))}
          <div className={styles.today} />
        </div>
      </div>
    </div>
  );
}
