import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type NewsDto } from "../api";
import { Icon, Loader, PageHead, StatusBadge, Thumb, formatDate, useConfirm, useToast } from "../ui";

export default function NewsListPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<NewsDto[] | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"date_desc" | "date_asc">("date_desc");
  const [status, setStatus] = useState<"" | "draft" | "published">("");

  const load = useCallback(() => {
    const params = new URLSearchParams({ sort });
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    api.get<NewsDto[]>(`/news?${params}`).then(setItems).catch(toast.error);
  }, [q, sort, status, toast]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const toggle = async (n: NewsDto) => {
    const next = n.status === "published" ? "draft" : "published";
    try {
      const upd = await api.patch<NewsDto>(`/news/${n.id}/status`, { status: next });
      setItems((list) => list?.map((x) => (x.id === n.id ? { ...upd, body: undefined } : x)) ?? null);
      toast.success(next === "published" ? "Новость опубликована" : "Новость снята с публикации");
    } catch (e) {
      toast.error(e);
    }
  };

  const remove = async (n: NewsDto) => {
    const ok = await confirm({ title: "Удалить новость?", text: <>Новость «{n.title}» будет удалена без возможности восстановления.</> });
    if (!ok) return;
    try {
      await api.del(`/news/${n.id}`);
      setItems((list) => list?.filter((x) => x.id !== n.id) ?? null);
      toast.success("Новость удалена");
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <>
      <PageHead title="Новости" sub="Публикации отображаются в разделе «Новости» и на главной странице.">
        <Link to="/news/new" className="a-btn a-btn-lime">
          <Icon name="plus" /> Добавить новость
        </Link>
      </PageHead>
      <div className="a-toolbar">
        <div className="a-search">
          <Icon name="search" size={16} />
          <input className="a-input" type="search" placeholder="Поиск по заголовку" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск по заголовку" />
        </div>
        <select className="a-select" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Фильтр по статусу">
          <option value="">Все статусы</option>
          <option value="published">Опубликованные</option>
          <option value="draft">Черновики</option>
        </select>
        <select className="a-select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Сортировка">
          <option value="date_desc">Сначала новые</option>
          <option value="date_asc">Сначала старые</option>
        </select>
      </div>
      <div className="a-card">
        {!items ? (
          <Loader />
        ) : items.length === 0 ? (
          <div className="a-empty">
            <strong>{q || status ? "Ничего не найдено" : "Новостей пока нет"}</strong>
            {q || status ? "Измените условия поиска." : <Link to="/news/new">Добавьте первую новость</Link>}
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table" data-testid="news-table">
              <thead>
                <tr>
                  <th className="a-hide-sm" style={{ width: 72 }}>
                    Обложка
                  </th>
                  <th>Заголовок</th>
                  <th>Дата публикации</th>
                  <th>Статус</th>
                  <th style={{ textAlign: "right" }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id}>
                    <td className="a-hide-sm">
                      <Thumb src={n.cover?.url} />
                    </td>
                    <td className="a-title-cell">
                      <Link to={`/news/${n.id}`}>{n.title}</Link>
                      <span className="a-sub">/news/{n.slug}/</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(n.publishedAt)}</td>
                    <td>
                      <StatusBadge status={n.status} />
                    </td>
                    <td>
                      <div className="a-row-actions">
                        <button type="button" className="a-btn a-btn-sm" onClick={() => toggle(n)}>
                          {n.status === "published" ? "Снять" : "Опубликовать"}
                        </button>
                        {n.status === "published" && (
                          <a className="a-icon-btn" href={`/news/${n.slug}/`} target="_blank" rel="noopener noreferrer" aria-label="Открыть на сайте" title="Открыть на сайте">
                            <Icon name="external" size={15} />
                          </a>
                        )}
                        <Link to={`/news/${n.id}`} className="a-icon-btn" aria-label={`Редактировать «${n.title}»`} title="Редактировать">
                          <Icon name="edit" size={15} />
                        </Link>
                        <button type="button" className="a-icon-btn danger" onClick={() => remove(n)} aria-label={`Удалить «${n.title}»`} title="Удалить">
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
