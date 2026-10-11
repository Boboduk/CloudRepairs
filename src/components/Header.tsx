import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LOGIN_URL, NAV } from "../content/site";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Закрываем меню при переходе
  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
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
    <header className={`${styles.header} ${scrolled || open ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Основная навигация">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <a className={styles.login} href={LOGIN_URL} target="_blank" rel="noopener noreferrer">
          Войти в систему
        </a>
        <button
          type="button"
          className={styles.burger}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>

      {/* Меню вне <header>: backdrop-filter шапки иначе обрезал бы fixed-слой */}
      <div id="mobile-menu" className={`${styles.mobile} ${open ? styles.mobileOpen : ""}`} hidden={!open}>
        <nav className="container" aria-label="Мобильная навигация">
          <ul className={styles.mobileList}>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/"} className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileActive : ""}`}>
                  {item.label}
                  <Icon name="arrow" size={20} />
                </NavLink>
              </li>
            ))}
          </ul>
          <a className={styles.mobileLogin} href={LOGIN_URL} target="_blank" rel="noopener noreferrer">
            Войти в систему
            <Icon name="external" size={18} />
          </a>
        </nav>
      </div>
    </>
  );
}
