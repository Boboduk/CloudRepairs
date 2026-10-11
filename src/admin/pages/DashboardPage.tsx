import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Icon, Loader, PageHead, StatusBadge, formatDate, useToast } from "../ui";
import { useAuth } from "../auth";

interface Stats {
  newsPublished: number;
  newsDrafts: number;
  partners: number;
  partnersVisible: number;
  cases: number;
  casesPublished: number;
  products: number;
  productsPublished: number;
  media: number;
  recentNews: { id: number; title: string; status: "draft" | "published"; updatedAt: string }[];
}

export default function DashboardPage() {
  const toast = useToast();
  const { admin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    api.get<Stats>("/stats").then(setStats).catch(toast.error);
  }, [toast]);

  return (
    <>
      <PageHead title="Главная панель" sub={`Здравствуйте${admin?.name ? `, ${admin.name}` : ""}! Здесь собрана сводка по содержимому сайта.`}>
        <Link to="/news/new" className="a-btn a-btn-lime">
          <Icon name="plus" /> Новая новость
        </Link>
      </PageHead>
      {!stats ? (
        <Loader />
      ) : (
        <>
          <div className="a-stats">
            <Link to="/news" className="a-card a-stat" data-testid="stat-news">
              <div className="a-stat-label">Опубликовано новостей</div>
              <div className="a-stat-value">{stats.newsPublished}</div>
              <div className="a-stat-sub">черновиков: {stats.newsDrafts}</div>
            </Link>
            <Link to="/partners" className="a-card a-stat" data-testid="stat-partners">
              <div className="a-stat-label">Партнёров</div>
              <div className="a-stat-value">{stats.partners}</div>
              <div className="a-stat-sub">показано на сайте: {stats.partnersVisible}</div>
            </Link>
            <Link to="/cases" className="a-card a-stat" data-testid="stat-cases">
              <div className="a-stat-label">Кейсов</div>
              <div className="a-stat-value">{stats.cases}</div>
              <div className="a-stat-sub">опубликовано: {stats.casesPublished}</div>
            </Link>
            <Link to="/products" className="a-card a-stat" data-testid="stat-products">
              <div className="a-stat-label">Продуктов</div>
              <div className="a-stat-value">{stats.products}</div>
              <div className="a-stat-sub">опубликовано: {stats.productsPublished}</div>
            </Link>
          </div>
          <div className="a-grid-2" style={{ marginTop: 16 }}>
            <div className="a-card a-card-pad">
              <h2 className="a-card-title">Последние изменения новостей</h2>
              {stats.recentNews.length === 0 ? (
                <p className="a-hint">Новостей пока нет.</p>
              ) : (
                <table className="a-table">
                  <tbody>
                    {stats.recentNews.map((n) => (
                      <tr key={n.id}>
                        <td className="a-title-cell">
                          <Link to={`/news/${n.id}`}>{n.title}</Link>
                          <span className="a-sub">{formatDate(n.updatedAt, true)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <StatusBadge status={n.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="a-card a-card-pad">
              <h2 className="a-card-title">Быстрые действия</h2>
              <div style={{ display: "grid", gap: 8 }}>
                <Link to="/pages/home" className="a-btn" style={{ justifyContent: "flex-start" }}>
                  <Icon name="pages" /> Тексты главной страницы
                </Link>
                <Link to="/pages/about" className="a-btn" style={{ justifyContent: "flex-start" }}>
                  <Icon name="pages" /> Страница «О нас»
                </Link>
                <Link to="/cases/new" className="a-btn" style={{ justifyContent: "flex-start" }}>
                  <Icon name="cases" /> Добавить кейс
                </Link>
                <Link to="/media" className="a-btn" style={{ justifyContent: "flex-start" }}>
                  <Icon name="media" /> Медиафайлы ({stats.media})
                </Link>
                <Link to="/settings" className="a-btn" style={{ justifyContent: "flex-start" }}>
                  <Icon name="settings" /> Контакты и пароль
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
