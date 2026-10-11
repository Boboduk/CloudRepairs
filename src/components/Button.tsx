import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "light";

interface Props {
  to: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  external?: boolean;
  icon?: ReactNode;
  className?: string;
}

/** Кнопка-ссылка: внутренние переходы через роутер, внешние — обычной ссылкой */
export function Button({ to, children, variant = "primary", size = "md", external, icon, className = "" }: Props) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(to);
  if (isExternal) {
    const newTab = to.startsWith("http");
    return (
      <a href={to} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
        {icon}
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {children}
      {icon}
    </Link>
  );
}
