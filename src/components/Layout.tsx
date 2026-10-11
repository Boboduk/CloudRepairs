import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** Общий каркас всех страниц: шапка, контент, подвал; прокрутка и анимация появления */
export function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pathname, hash]);

  // Плавное появление блоков с классом .reveal
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        Перейти к содержанию
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
