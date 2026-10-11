import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type { CaseItem, DetailKind, InitialData, NewsItem, ProductItem, SiteData } from "../../shared/types";

/**
 * Данные публичного сайта. Сервер встраивает их в HTML (SSR), клиент подхватывает при гидратации.
 * При переходах по сайту данные обновляются с сервера, если устарели, — так изменения
 * из админки видны без перезагрузки страницы.
 */
interface Ctx {
  site: SiteData;
  initialDetail: InitialData["detail"];
}

const SiteContext = createContext<Ctx | null>(null);
const REFRESH_MS = 30_000;

export function SiteDataProvider({ initial, children }: { initial: InitialData; children: ReactNode }) {
  const [site, setSite] = useState(initial.site);
  const loadedAt = useRef(initial.loadedAt);
  const location = useLocation();

  useEffect(() => {
    if (Date.now() - loadedAt.current < REFRESH_MS) return;
    let alive = true;
    fetch("/api/public/site", { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: SiteData | null) => {
        if (alive && d) {
          loadedAt.current = Date.now();
          setSite(d);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [location.pathname]);

  return <SiteContext.Provider value={{ site, initialDetail: initial.detail }}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteData {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("SiteDataProvider не подключен");
  return ctx.site;
}

export function usePage<K extends keyof SiteData["pages"]>(key: K): SiteData["pages"][K] {
  return useSite().pages[key];
}

type DetailMap = { news: NewsItem; cases: CaseItem; products: ProductItem };

/** Запись для страницы новости / кейса / продукта: из SSR или с сервера */
export function useDetail<K extends DetailKind>(kind: K, slug: string): { item: DetailMap[K] | null; loading: boolean } {
  const ctx = useContext(SiteContext)!;
  const initial = ctx.initialDetail && ctx.initialDetail.kind === kind && ctx.initialDetail.slug === slug ? ctx.initialDetail : null;
  const [state, setState] = useState<{ key: string; item: DetailMap[K] | null; loading: boolean }>(() => ({
    key: `${kind}/${slug}`,
    item: (initial?.item as DetailMap[K]) ?? null,
    loading: !initial,
  }));

  useEffect(() => {
    const key = `${kind}/${slug}`;
    if (state.key === key && !state.loading) return;
    let alive = true;
    setState({ key, item: null, loading: true });
    fetch(`/api/public/${kind}/${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((item: DetailMap[K] | null) => alive && setState({ key, item, loading: false }))
      .catch(() => alive && setState({ key, item: null, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, slug]);

  return state.key === `${kind}/${slug}` ? { item: state.item, loading: state.loading } : { item: null, loading: true };
}

/** Ссылки на почту/Телеграм из настроек сайта */
export function useContacts() {
  const s = useSite().settings;
  const requestHref = (subject = "Заявка с сайта CloudRepairs") => `mailto:${s.email}?subject=${encodeURIComponent(subject)}`;
  const telegramUrl = s.telegramMain ? `https://t.me/${s.telegramMain}` : "";
  return { settings: s, requestHref, telegramUrl };
}
