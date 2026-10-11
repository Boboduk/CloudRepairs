import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Icon, Loader, PageHead, formatDate, useToast } from "../ui";

interface PageInfo {
  key: string;
  label: string;
  path: string;
  updatedAt: string | null;
}

export default function PagesListPage() {
  const toast = useToast();
  const [pages, setPages] = useState<PageInfo[] | null>(null);
  useEffect(() => {
    api.get<PageInfo[]>("/pages").then(setPages).catch(toast.error);
  }, [toast]);
  return (
    <>
      <PageHead title="Тексты страниц" sub="Заголовки, тексты, изображения и кнопки основных страниц сайта. Вёрстка страниц при этом не меняется." />
      <div className="a-card">
        {!pages ? (
          <Loader />
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>Страница</th>
                <th className="a-hide-sm">Адрес</th>
                <th>Изменена</th>
                <th style={{ textAlign: "right" }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.key}>
                  <td className="a-title-cell">
                    <Link to={`/pages/${p.key}`}>{p.label}</Link>
                  </td>
                  <td className="a-hide-sm">{p.path}</td>
                  <td>{p.updatedAt ? formatDate(p.updatedAt, true) : "исходный текст"}</td>
                  <td>
                    <div className="a-row-actions">
                      <a className="a-icon-btn" href={p.path} target="_blank" rel="noopener noreferrer" aria-label="Открыть на сайте" title="Открыть на сайте">
                        <Icon name="external" size={15} />
                      </a>
                      <Link to={`/pages/${p.key}`} className="a-icon-btn" aria-label={`Редактировать: ${p.label}`} title="Редактировать">
                        <Icon name="edit" size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
