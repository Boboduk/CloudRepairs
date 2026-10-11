import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api, type MediaRef, type Status } from "../api";
import { Icon, Loader, MoveButtons, PageHead, StatusBadge, Thumb, move, useConfirm, useToast } from "../ui";

interface Row {
  id: number;
  title: string;
  slug: string;
  status: Status;
}

/** Список записей с ручным порядком, публикацией и удалением (кейсы, продукты) */
export function OrderedList<T extends Row>({
  endpoint,
  title,
  sub,
  noun,
  addLabel,
  image,
  extra,
  publicHref,
}: {
  endpoint: string;
  title: string;
  sub: ReactNode;
  noun: { one: string; deleted: string; published: string; unpublished: string };
  addLabel: string;
  image: (r: T) => MediaRef | null;
  extra?: (r: T) => ReactNode;
  publicHref: (r: T) => string | null;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<T[] | null>(null);

  useEffect(() => {
    api.get<T[]>(endpoint).then(setItems).catch(toast.error);
  }, [endpoint, toast]);

  const toggle = async (r: T) => {
    const status = r.status === "published" ? "draft" : "published";
    try {
      const upd = await api.patch<T>(`${endpoint}/${r.id}/status`, { status });
      setItems((list) => list?.map((x) => (x.id === r.id ? { ...upd, body: undefined } : x)) ?? null);
      toast.success(status === "published" ? noun.published : noun.unpublished);
    } catch (e) {
      toast.error(e);
    }
  };

  const reorder = async (index: number, delta: number) => {
    if (!items) return;
    const prev = items;
    const next = move(items, index, delta);
    setItems(next);
    try {
      await api.post(`${endpoint}/reorder`, { ids: next.map((x) => x.id) });
      toast.success("Порядок сохранён");
    } catch (e) {
      setItems(prev);
      toast.error(e);
    }
  };

  const remove = async (r: T) => {
    if (!(await confirm({ title: `Удалить: ${noun.one}?`, text: <>«{r.title}» будет удалён(а) без возможности восстановления.</> }))) return;
    try {
      await api.del(`${endpoint}/${r.id}`);
      setItems((list) => list?.filter((x) => x.id !== r.id) ?? null);
      toast.success(noun.deleted);
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <>
      <PageHead title={title} sub={sub}>
        <Link to={`${endpoint}/new`} className="a-btn a-btn-lime">
          <Icon name="plus" /> {addLabel}
        </Link>
      </PageHead>
      <div className="a-card">
        {!items ? (
          <Loader />
        ) : items.length === 0 ? (
          <div className="a-empty">
            <strong>Записей пока нет</strong>
            <Link to={`${endpoint}/new`}>{addLabel}</Link>
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table" data-testid="ordered-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Порядок</th>
                  <th className="a-hide-sm" style={{ width: 72 }}>
                    Изображение
                  </th>
                  <th>Название</th>
                  <th>Статус</th>
                  <th style={{ textAlign: "right" }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => {
                  const href = r.status === "published" ? publicHref(r) : null;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="a-row-tools">
                          <MoveButtons index={i} length={items.length} onMove={(d) => reorder(i, d)} label={r.title} />
                        </div>
                      </td>
                      <td className="a-hide-sm">
                        <Thumb src={image(r)?.url} />
                      </td>
                      <td className="a-title-cell">
                        <Link to={`${endpoint}/${r.id}`}>{r.title}</Link>
                        {extra && <span className="a-sub">{extra(r)}</span>}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <div className="a-row-actions">
                          <button type="button" className="a-btn a-btn-sm" onClick={() => toggle(r)}>
                            {r.status === "published" ? "Снять" : "Опубликовать"}
                          </button>
                          {href && (
                            <a className="a-icon-btn" href={href} target="_blank" rel="noopener noreferrer" aria-label="Открыть на сайте" title="Открыть на сайте">
                              <Icon name="external" size={15} />
                            </a>
                          )}
                          <Link to={`${endpoint}/${r.id}`} className="a-icon-btn" aria-label={`Редактировать «${r.title}»`} title="Редактировать">
                            <Icon name="edit" size={15} />
                          </Link>
                          <button type="button" className="a-icon-btn danger" onClick={() => remove(r)} aria-label={`Удалить «${r.title}»`} title="Удалить">
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
