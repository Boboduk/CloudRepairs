import type { ReactNode } from "react";
import styles from "./Section.module.css";

interface Props {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  tone?: "default" | "cream" | "navy";
  align?: "left" | "center";
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Информационная секция с единым ритмом отступов и заголовков */
export function Section({ id, eyebrow, title, lead, tone = "default", align = "left", aside, children, className = "" }: Props) {
  const titleId = id && title ? `${id}-title` : undefined;
  return (
    <section id={id} className={`${styles.section} ${styles[tone]} ${className}`} aria-labelledby={titleId}>
      <div className="container">
        {(eyebrow || title || lead) && (
          <div className={`${styles.head} ${align === "center" ? styles.center : ""} reveal`}>
            <div>
              {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {lead && <p className={styles.lead}>{lead}</p>}
            </div>
            {aside && <div className={styles.aside}>{aside}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
