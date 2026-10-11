import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "../content/internalTraining";
import { Icon } from "./Icon";
import styles from "./Gallery.module.css";

/** Галерея с увеличением: клавиатура (←, →, Esc), свайп на телефоне */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (index === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul className={styles.grid}>
        {images.map((img, i) => (
          <li key={img.src}>
            <button type="button" className={styles.thumb} onClick={() => setIndex(i)} aria-label={`Открыть изображение: ${img.alt}`}>
              <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
            </button>
            {img.caption && <p className={styles.caption}>{img.caption}</p>}
          </li>
        ))}
      </ul>

      {current && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <figure className={styles.figure} onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.alt} />
            <figcaption>
              {current.caption ?? current.alt} <span>{index! + 1} / {images.length}</span>
            </figcaption>
          </figure>
          <button ref={closeBtn} type="button" className={`${styles.ctrl} ${styles.close}`} onClick={close} aria-label="Закрыть">
            <Icon name="close" />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" className={`${styles.ctrl} ${styles.prev}`} onClick={(e) => (e.stopPropagation(), step(-1))} aria-label="Предыдущее">
                <Icon name="chevronLeft" />
              </button>
              <button type="button" className={`${styles.ctrl} ${styles.next}`} onClick={(e) => (e.stopPropagation(), step(1))} aria-label="Следующее">
                <Icon name="chevronRight" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
