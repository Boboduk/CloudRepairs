import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import styles from "./BrowserFrame.module.css";

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  url?: string;
  className?: string;
  priority?: boolean;
}

/** Скриншот системы в «окне браузера» с увеличением по клику (Esc — закрыть) */
export function BrowserFrame({ src, alt, width, height, url = "cloudrepairs.ru", className = "", priority }: Props) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <figure className={`${styles.frame} ${className}`}>
        <div className={styles.bar} aria-hidden="true">
          <span />
          <span />
          <span />
          <div className={styles.url}>{url}</div>
        </div>
        <button type="button" className={styles.shot} onClick={() => setOpen(true)} aria-label={`Увеличить: ${alt}`}>
          <img src={src} alt={alt} width={width} height={height} loading={priority ? "eager" : "lazy"} decoding="async" />
          <span className={styles.zoom}>
            <Icon name="zoom" size={20} />
          </span>
        </button>
        <figcaption className="visually-hidden">{alt}</figcaption>
      </figure>

      {open && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)}>
          <img src={src} alt={alt} width={width} height={height} onClick={(e) => e.stopPropagation()} />
          <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Закрыть">
            <Icon name="close" />
          </button>
        </div>
      )}
    </>
  );
}
