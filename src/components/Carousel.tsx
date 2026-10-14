import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Carousel.module.css";

interface Props {
  items: ReactNode[];
  /** Подпись для экранных дикторов */
  label: string;
  /** Сколько слайдов видно: на широком экране, на планшете (≤960px) и на телефоне (≤640px) */
  perView?: { lg: number; md?: number; sm?: number };
  /** Автопрокрутка, мс (останавливается при наведении, фокусе и при «уменьшении движения» в системе) */
  autoplay?: number;
  /** Цвет элементов управления: на светлом или тёмном фоне */
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Карусель без зависимостей: прокрутка со «щелчком» (scroll-snap), свайп на телефоне,
 * стрелки, точки, клавиши ←/→. Работает и без JavaScript — как горизонтальная прокрутка.
 */
export function Carousel({ items, label, perView = { lg: 1 }, autoplay, tone = "light", className = "" }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(Math.max(0, items.length - perView.lg));
  const [paused, setPaused] = useState(false);

  const step = useCallback(() => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return first.offsetWidth + gap;
  }, []);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const s = step();
    if (!s) return;
    const visible = Math.max(1, Math.round((el.clientWidth + (parseFloat(getComputedStyle(el).columnGap) || 0)) / s));
    setMaxIndex(Math.max(0, items.length - visible));
    setIndex(Math.min(Math.round(el.scrollLeft / s), Math.max(0, items.length - visible)));
  }, [items.length, step]);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const target = Math.max(0, Math.min(i, maxIndex));
      el.scrollTo({ left: target * step(), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      setIndex(target);
    },
    [maxIndex, step],
  );

  useEffect(() => {
    if (!autoplay || paused || maxIndex === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => goTo(index >= maxIndex ? 0 : index + 1), autoplay);
    return () => clearInterval(t);
  }, [autoplay, paused, maxIndex, index, goTo]);

  if (items.length === 0) return null;

  const vars = { "--per": perView.lg, "--per-md": perView.md ?? Math.min(perView.lg, 2), "--per-sm": perView.sm ?? 1 } as CSSProperties;
  const controls = maxIndex > 0;

  return (
    <div
      className={`${styles.carousel} ${tone === "dark" ? styles.dark : ""} ${className}`}
      style={vars}
      role="region"
      aria-roledescription="карусель"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <ul
        ref={track}
        className={styles.track}
        tabIndex={controls ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") (e.preventDefault(), goTo(index + 1));
          if (e.key === "ArrowLeft") (e.preventDefault(), goTo(index - 1));
        }}
      >
        {items.map((item, i) => (
          <li key={i} className={styles.slide} aria-roledescription="слайд" aria-label={`${i + 1} из ${items.length}`}>
            {item}
          </li>
        ))}
      </ul>
      {controls && (
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Назад">
            <Icon name="chevronLeft" size={20} />
          </button>
          <div className={styles.dots}>
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button key={i} type="button" className={`${styles.dot} ${i === index ? styles.dotActive : ""}`} onClick={() => goTo(i)} aria-label={`К слайду ${i + 1}`} aria-current={i === index || undefined} />
            ))}
          </div>
          <button type="button" className={styles.arrow} onClick={() => goTo(index + 1)} disabled={index >= maxIndex} aria-label="Вперёд">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
