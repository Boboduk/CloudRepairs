import styles from "./RichText.module.css";

/**
 * Вывод текста из визуального редактора. HTML очищается на сервере при сохранении
 * (разрешены только заголовки, абзацы, списки, ссылки, изображения из медиатеки).
 */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return <div className={`${styles.rich} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
