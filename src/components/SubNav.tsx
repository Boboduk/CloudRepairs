import { useEffect, useState } from "react";
import styles from "./SubNav.module.css";

/** Липкая навигация по разделам страницы с подсветкой текущего раздела */
export function SubNav({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className={styles.nav} aria-label={label}>
      <div className={`container ${styles.inner}`}>
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} className={`${styles.link} ${active === i.id ? styles.active : ""}`} aria-current={active === i.id ? "true" : undefined}>
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
