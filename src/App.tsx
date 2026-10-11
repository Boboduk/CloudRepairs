import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import HomePage from "./pages/HomePage";
import TrainingPage from "./pages/TrainingPage";
import AboutPage from "./pages/AboutPage";
import ProductPage from "./pages/ProductPage";
import NewsListPage from "./pages/NewsListPage";
import { CasePage, NewsPage, ProductDetailPage } from "./pages/DetailPages";
import NotFoundPage from "./pages/NotFoundPage";

export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

/** Маршруты совпадают с URL оригинального сайта (со слешем на конце); см. также shared/routes.ts */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="obuchen" element={<TrainingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="vnutyankaya-training" element={<ProductPage />} />
        <Route path="news" element={<NewsListPage />} />
        <Route path="news/:slug" element={<NewsPage />} />
        <Route path="cases/:slug" element={<CasePage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
