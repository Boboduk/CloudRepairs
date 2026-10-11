import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App, ROUTER_FUTURE } from "./App";
import { SiteDataProvider } from "./data/SiteData";
import type { InitialData } from "../shared/types";
import "./styles/global.css";

// Сервер отрисовывает страницу и встраивает данные — клиент их «оживляет» (гидратация)
const initial = JSON.parse(document.getElementById("__DATA__")!.textContent!) as InitialData;

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <BrowserRouter future={ROUTER_FUTURE}>
      <SiteDataProvider initial={initial}>
        <App />
      </SiteDataProvider>
    </BrowserRouter>
  </StrictMode>,
);
