import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Внутренние адреса — через роутер, внешние (http, mailto, tel) — обычной ссылкой */
export function SmartLink({ to, className, children, ariaLabel }: { to: string; className?: string; children: ReactNode; ariaLabel?: string }) {
  if (/^(https?:|mailto:|tel:)/.test(to)) {
    const external = to.startsWith("http");
    return (
      <a href={to} className={className} aria-label={ariaLabel} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
