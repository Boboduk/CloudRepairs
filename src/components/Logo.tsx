import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

/**
 * Временный текстовый логотип. Оригинальный логотип CloudRepairs получить
 * не удалось — замените на файл public/logo.svg и <img> ниже.
 */
export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link to="/" className={`${styles.logo} ${onDark ? styles.onDark : ""}`} aria-label="CloudRepairs — на главную">
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" className={styles.markBg} />
        <path d="M9 20.5a4.5 4.5 0 0 1 .6-8.96A6 6 0 0 1 21.3 12a4.25 4.25 0 0 1 1.2 8.5z" fill="none" stroke="#3B82F6" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M13 17.5l2.2 2.2 4-4.4" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={styles.word}>
        Cloud<span className={styles.wordAccent}>Repairs</span>
      </span>
    </Link>
  );
}
