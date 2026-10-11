import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type MediaItem } from "../api";
import { Icon, Loader, Modal, PageHead, TextInput, formatDate, useConfirm, useToast } from "../ui";
import { UploadZone, formatSize } from "../components/Media";

interface Usage {
  type: string;
  id: number | string;
  title: string;
}

export default function MediaPage() {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<MediaItem | null>(null);

  const load = useCallback(() => {
    api
      .get<MediaItem[]>(`/media${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then(setItems)
      .catch(toast.error);
  }, [q, toast]);
  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <>
      <PageHead title="Медиафайлы" sub="Изображения для новостей, кейсов, продуктов, партнёров и страниц. Файлы проверяются и оптимизируются при загрузке." />
      <div className="a-card a-card-pad" style={{ marginBottom: 16 }}>
        <UploadZone onUploaded={(up) => setItems((list) => [...up, ...(list ?? [])])} />
      </div>
      <div className="a-toolbar">
        <div className="a-search">
          <Icon name="search" size={16} />
          <input className="a-input" type="search" placeholder="Поиск по имени или описанию" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск файлов" />
        </div>
        {items && <span className="a-hint">Файлов: {items.length}</span>}
      </div>
      {!items ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="a-card a-empty">
          <strong>{q ? "Ничего не найдено" : "Файлов пока нет"}</strong>
        </div>
      ) : (
        <div className="a-media-grid" data-testid="media-grid">
          {items.map((m) => (
            <button key={m.id} type="button" className="a-media-item" onClick={() => setOpen(m)} title={m.originalName}>
              <img src={`${m.url}?v=${encodeURIComponent(m.updatedAt)}`} alt={m.alt} loading="lazy" />
              <span>{m.alt || m.originalName}</span>
            </button>
          ))}
        </div>
      )}
      {open && (
        <MediaDetail
          item={open}
          onClose={() => setOpen(null)}
          onChanged={(m) => {
            setItems((list) => list?.map((x) => (x.id === m.id ? m : x)) ?? null);
            setOpen(m);
          }}
          onDeleted={(id) => {
            setItems((list) => list?.filter((x) => x.id !== id) ?? null);
            setOpen(null);
          }}
        />
      )}
    </>
  );
}

function MediaDetail({ item, onClose, onChanged, onDeleted }: { item: MediaItem; onClose: () => void; onChanged: (m: MediaItem) => void; onDeleted: (id: number) => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [alt, setAlt] = useState(item.alt);
  const [usage, setUsage] = useState<Usage[] | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<MediaItem & { usage: Usage[] }>(`/media/${item.id}`)
      .then((r) => setUsage(r.usage))
      .catch(toast.error);
  }, [item.id, toast]);

  const saveAlt = async () => {
    setBusy(true);
    try {
      onChanged(await api.patch<MediaItem>(`/media/${item.id}`, { alt }));
      toast.success("Описание сохранено");
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(false);
    }
  };

  const replaceFile = async (file: File) => {
    setBusy(true);
    try {
      onChanged(await api.upload<MediaItem>(`/media/${item.id}/file`, file, {}, "PUT"));
      toast.success("Файл заменён — новое изображение показывается везде, где использовалось старое");
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (usage && usage.length) return toast.error("Файл используется на сайте — сначала замените его в указанных местах");
    if (!(await confirm({ title: "Удалить файл?", text: <>Файл «{item.originalName}» будет удалён без возможности восстановления.</> }))) return;
    setBusy(true);
    try {
      await api.del(`/media/${item.id}`);
      toast.success("Файл удалён");
      onDeleted(item.id);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && Array.isArray(e.details)) setUsage(e.details as Usage[]);
      toast.error(e instanceof ApiError ? e.message : e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Файл"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="a-btn a-btn-danger" onClick={remove} disabled={busy || usage === null}>
            <Icon name="trash" size={15} /> Удалить
          </button>
          <button type="button" className="a-btn" onClick={() => fileInput.current?.click()} disabled={busy}>
            <Icon name="replace" size={15} /> Заменить файл
          </button>
          <button type="button" className="a-btn a-btn-primary" onClick={saveAlt} disabled={busy || alt === item.alt}>
            Сохранить описание
          </button>
        </>
      }
    >
      <input
        ref={fileInput}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        data-testid="replace-input"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) replaceFile(f);
          e.target.value = "";
        }}
      />
      <div className="a-media-detail">
        <img src={`${item.url}?v=${encodeURIComponent(item.updatedAt)}`} alt={item.alt} />
        <div>
          <dl className="a-dl">
            <dt>Имя</dt>
            <dd>{item.originalName}</dd>
            <dt>Адрес</dt>
            <dd>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.url}
              </a>
            </dd>
            <dt>Размер</dt>
            <dd>
              {item.width}×{item.height} px, {formatSize(item.size)}
            </dd>
            <dt>Загружен</dt>
            <dd>{formatDate(item.createdAt, true)}</dd>
            {item.updatedAt !== item.createdAt && (
              <>
                <dt>Заменён</dt>
                <dd>{formatDate(item.updatedAt, true)}</dd>
              </>
            )}
          </dl>
          <TextInput label="Описание (alt)" value={alt} onChange={setAlt} max={300} hint="Кратко опишите изображение — это важно для доступности и поисковых систем." />
          <div className="a-field">
            <span className="a-label">Где используется</span>
            {usage === null ? (
              <div className="a-hint">Проверка…</div>
            ) : usage.length === 0 ? (
              <div className="a-hint">Нигде не используется — файл можно удалить.</div>
            ) : (
              <ul className="a-usage" data-testid="media-usage">
                {usage.map((u, i) => (
                  <li key={i}>
                    {u.type}: {u.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
