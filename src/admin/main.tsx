import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth";
import { ConfirmProvider, ToastProvider } from "./ui";
import { AdminApp } from "./AdminApp";
import "./admin.css";

createRoot(document.getElementById("admin-root")!).render(
  <StrictMode>
    <BrowserRouter basename="/admin" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <AdminApp />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
