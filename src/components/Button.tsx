import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

export type ButtonVariant = "lime" | "navy" | "light" | "outlineLight" | "outline" | "link";

interface Props {
  to: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/** Кнопка-ссылка: внутренние переходы через роутер, внешние (http, mailto, tel) — обычной ссылкой */
export function Button({ to, children, variant = "lime", size = "md", icon, className = "", ariaLabel }: Props) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
  const content = (
    <>
      <span>{children}</span>
      {icon && <span className={styles.icon}>{icon}</span>}
    </>
  );
  if (/^(https?:|mailto:|tel:)/.test(to)) {
    const newTab = to.startsWith("http");
    return (
      <a href={to} className={cls} aria-label={ariaLabel} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} aria-label={ariaLabel}>
      {content}
    </Link>
  );
}
