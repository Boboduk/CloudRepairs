import type { ReactNode } from "react";
import styles from "./Section.module.css";

interface Props {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  tone?: "default" | "soft" | "deep";
  children?: ReactNode;
  headingLevel?: 2 | 3;
  aside?: ReactNode;
}

/** Информационная секция с единым ритмом отступов и заголовков */
export function Section({ id, eyebrow, title, lead, tone = "default", children, aside }: Props) {
  return (
    <section id={id} className={`${styles.section} ${styles[tone]}`} aria-labelledby={id && title ? `${id}-title` : undefined}>
      <div className="container">
        {(eyebrow || title || lead) && (
          <div className={styles.head}>
            <div>
              {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
              {title && (
                <h2 id={id ? `${id}-title` : undefined} className={styles.title}>
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
