import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { Icon, Loader, useConfirm, type IconName } from "./ui";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

const NewsListPage = lazy(() => import("./pages/NewsListPage"));
const NewsEditPage = lazy(() => import("./pages/NewsEditPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const CasesListPage = lazy(() => import("./pages/CasesListPage"));
const CaseEditPage = lazy(() => import("./pages/CaseEditPage"));
const ProductsListPage = lazy(() => import("./pages/ProductsListPage"));
const ProductEditPage = lazy(() => import("./pages/ProductEditPage"));
const PagesListPage = lazy(() => import("./pages/PagesListPage"));
const PageEditPage = lazy(() => import("./pages/PageEditPage"));
const MediaPage = lazy(() => import("./pages/MediaPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "Главная панель", icon: "dashboard", end: true },
  { to: "/news", label: "Новости", icon: "news" },
  { to: "/partners", label: "Партнёры", icon: "partners" },
  { to: "/cases", label: "Кейсы", icon: "cases" },
  { to: "/products", label: "Продукты", icon: "products" },
  { to: "/pages/about", label: "Страница «О нас»", icon: "pages" },
  { to: "/pages", label: "Тексты страниц", icon: "pages", end: true },
  { to: "/media", label: "Медиафайлы", icon: "media" },
  { to: "/settings", label: "Настройки", icon: "settings" },
];

export function AdminApp() {
  const { admin, checking } = useAuth();
  if (checking) return <Loader text="Проверка сессии…" />;
  if (!admin) return <LoginPage />;
  return <Shell />;
}

function Shell() {
  const { admin, logout } = useAuth();
  const confirm = useConfirm();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname]);

  const onLogout = async () => {
    if (await confirm({ title: "Выход", text: "Завершить сеанс работы в админ-панели?", confirmLabel: "Выйти", danger: false })) await logout();
  };

  return (
    <div className={`a-shell ${menu ? "menu-open" : ""}`}>
      <div className="a-topbar">
        <button type="button" onClick={() => setMenu((m) => !m)} aria-label="Меню" aria-expanded={menu}>
          <Icon name="menu" size={20} />
        </button>
        <strong>CloudRepairs · админ-панель</strong>
      </div>
      <aside className="a-sidebar" aria-label="Разделы админ-панели">
        <NavLink to="/" className="a-brand">
          <img src="/brand/symbol-256.png" alt="" width={34} height={41} />
          <span>
            <strong>CloudRepairs</strong>
            <span>Управление сайтом</span>
          </span>
        </NavLink>
        <nav className="a-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={n.to === "/pages" ? () => (location.pathname.startsWith("/pages") && !location.pathname.startsWith("/pages/about") ? "active" : "") : undefined}
            >
              <Icon name={n.icon} /> {n.label}
            </NavLink>
          ))}
          <div className="a-nav-sep" />
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Icon name="external" /> Открыть сайт
          </a>
          <button type="button" onClick={onLogout} data-testid="logout">
            <Icon name="logout" /> Выйти
          </button>
        </nav>
        <div className="a-sidebar-foot">
          Вы вошли как
          <br />
          <strong style={{ color: "#fff" }}>{admin?.name || admin?.email}</strong>
        </div>
      </aside>
      {menu && <div className="a-backdrop" onClick={() => setMenu(false)} aria-hidden="true" />}
      <main className="a-main">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="news" element={<NewsListPage />} />
            <Route path="news/:id" element={<NewsEditPage />} />
            <Route path="partners" element={<PartnersPage />} />
            <Route path="cases" element={<CasesListPage />} />
            <Route path="cases/:id" element={<CaseEditPage />} />
            <Route path="products" element={<ProductsListPage />} />
            <Route path="products/:id" element={<ProductEditPage />} />
            <Route path="pages" element={<PagesListPage />} />
            <Route path="pages/:key" element={<PageEditPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="a-card a-empty">
      <strong>Раздел не найден</strong>
      <NavLink to="/">Вернуться на главную панель</NavLink>
    </div>
  );
}
