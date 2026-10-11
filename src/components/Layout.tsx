import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** Общий каркас всех страниц */
export function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    // Переход к якорю (например, /obuchen/#contacts)
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pathname, hash]);
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
