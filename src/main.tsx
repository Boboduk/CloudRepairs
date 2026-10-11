import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App, ROUTER_FUTURE } from "./App";
import "./styles/global.css";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter future={ROUTER_FUTURE}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// В production страницы пререндерены — гидратируем, если HTML построен для этого же адреса.
// Иначе (dev-режим или fallback хостинга на index.html) — обычный рендер.
const norm = (p: string) => (p.endsWith("/") ? p : p + "/");
if (root.firstElementChild && root.dataset.path && norm(root.dataset.path) === norm(window.location.pathname)) {
  hydrateRoot(root, app);
} else {
  root.innerHTML = "";
  createRoot(root).render(app);
}
