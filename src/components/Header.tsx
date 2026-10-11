import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LOGIN_URL, NAV, requestHref } from "../content/site";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import styles from "./Header.module.css";

const isPage = (to: string) => !to.includes("#");

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const solid = scrolled && !open;

  return (
    <>
      <header className={`${styles.header} ${solid ? styles.solid : styles.clear}`}>
        <div className={`container ${styles.inner}`}>
          <Logo />
          <nav className={styles.nav} aria-label="Основная навигация">
            {NAV.map((item) =>
              isPage(item.to) ? (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                  {item.label}
                </NavLink>
              ) : (
                <Link key={item.to} to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className={styles.actions}>
            <a className={styles.login} href={LOGIN_URL} target="_blank" rel="noopener noreferrer">
              Войти
            </a>
            <a className={styles.cta} href={requestHref()}>
              Связаться
            </a>
          </div>
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
      <div id="mobile-menu" className={styles.mobile} hidden={!open}>
        <nav className="container" aria-label="Мобильная навигация">
          <ul className={styles.mobileList}>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={styles.mobileLink} onClick={() => setOpen(false)}>
                  {item.label}
                  <Icon name="arrowUpRight" size={22} />
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <a className={styles.mobileCta} href={requestHref()}>
              Оставить заявку
            </a>
            <a className={styles.mobileLogin} href={LOGIN_URL} target="_blank" rel="noopener noreferrer">
              Войти в систему <Icon name="external" size={18} />
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
