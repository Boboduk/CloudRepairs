import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { App, ROUTER_FUTURE } from "./App";
import { SiteDataProvider } from "./data/SiteData";
import type { InitialData } from "../shared/types";

/** Серверный рендеринг страницы с данными из БД */
export function render(url: string, data: InitialData) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url} future={ROUTER_FUTURE}>
        <SiteDataProvider initial={data}>
          <App />
        </SiteDataProvider>
      </StaticRouter>
    </StrictMode>,
  );
  return { html };
}
