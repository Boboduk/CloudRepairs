import styles from "./Figure.module.css";

/** Изображение с подписью для редактируемых секций страниц */
export function Figure({ src, alt, caption, className = "" }: { src: string; alt?: string; caption?: string; className?: string }) {
  return (
    <figure className={`${styles.figure} ${className}`}>
      <img src={src} alt={alt || caption || ""} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
