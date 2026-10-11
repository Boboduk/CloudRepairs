import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NAV } from "../content/site";
import { useContacts, useSite } from "../data/SiteData";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import styles from "./Header.module.css";

const isPage = (to: string) => !to.includes("#");

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const site = useSite();
  const { settings, requestHref } = useContacts();
  // «Новости» в меню появляются, когда опубликована хотя бы одна новость
  const nav = site.news.length ? [...NAV.slice(0, 4), { label: "Новости", to: "/news/" }, ...NAV.slice(4)] : NAV;

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
            {nav.map((item) =>
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
            <a className={styles.cta} href={requestHref()}>
              {settings.headerCta}
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
            {nav.map((item) => (
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
          </div>
        </nav>
      </div>
    </>
  );
}
