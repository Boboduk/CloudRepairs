import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

/** Логотип CloudRepairs (из макета Figma, слой «logo_h») */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`${styles.logo} ${className}`} aria-label="CloudRepairs — на главную">
      <img src="/brand/logo-horizontal.png" alt="CloudRepairs" width={172} height={38} />
    </Link>
  );
}
