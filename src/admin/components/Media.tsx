import { useCallback, useEffect, useRef, useState } from "react";
import { api, type MediaItem, type MediaRef } from "../api";
import { Icon, Modal, useToast } from "../ui";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

/** Загрузка одного или нескольких файлов (кнопка + перетаскивание) */
export function UploadZone({ onUploaded, multiple = true, compact = false }: { onUploaded: (items: MediaItem[]) => void; multiple?: boolean; compact?: boolean }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(0);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, multiple ? 20 : 1);
    if (!list.length) return;
    setBusy(list.length);
    const done: MediaItem[] = [];
    for (const f of list) {
      try {
        done.push(await api.upload<MediaItem>("/media", f, { alt: "" }));
      } catch (e) {
        toast.error(`«${f.name}»: ${(e as Error).message}`);
      }
      setBusy((n) => n - 1);
    }
    if (done.length) {
      toast.success(done.length === 1 ? "Изображение загружено" : `Загружено изображений: ${done.length}`);
      onUploaded(done);
    }
  };

  return (
    <div
      className={`a-dropzone ${drag ? "drag" : ""}`}
      style={compact ? { padding: 14 } : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        upload(e.dataTransfer.files);
      }}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
    >
      <Icon name="upload" size={22} />
      <strong style={{ color: "var(--a-navy)" }}>{busy ? `Загрузка… (${busy})` : "Загрузить изображение"}</strong>
      {!compact && <span style={{ fontSize: 13 }}>Перетащите файлы сюда или нажмите для выбора. JPG, PNG, WebP, GIF, AVIF — изображение будет оптимизировано.</span>}
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        hidden
        data-testid="upload-input"
        onChange={(e) => {
          if (e.target.files) upload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Выбор изображения из медиатеки (с возможностью загрузить новое) */
export function MediaPicker({ onSelect, onClose, title = "Выбор изображения" }: { onSelect: (m: MediaItem) => void; onClose: () => void; title?: string }) {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);

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
    <Modal
      title={title}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="a-btn" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="a-btn a-btn-primary" disabled={!selected} onClick={() => selected && onSelect(selected)}>
            Выбрать
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <UploadZone
          compact
          multiple={false}
          onUploaded={(up) => {
            setItems((list) => [...up, ...(list ?? [])]);
            setSelected(up[0]);
          }}
        />
        <div className="a-search" style={{ maxWidth: "none" }}>
          <Icon name="search" size={16} />
          <input className="a-input" placeholder="Поиск по имени файла или описанию" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск изображений" />
        </div>
        {!items ? (
          <div className="a-empty">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="a-empty">
            <strong>Изображений нет</strong>Загрузите первое изображение выше.
          </div>
        ) : (
          <div className="a-media-grid">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`a-media-item ${selected?.id === m.id ? "selected" : ""}`}
                onClick={() => setSelected(m)}
                onDoubleClick={() => onSelect(m)}
                aria-pressed={selected?.id === m.id}
                title={m.originalName}
              >
                <img src={m.url} alt={m.alt} loading="lazy" />
                <span>{m.alt || m.originalName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/** Одно изображение, связанное с записью по id медиафайла */
export function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: MediaRef | null;
  onChange: (m: MediaRef | null) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="a-image-field">
        {value ? <img src={value.url} alt={value.alt} /> : <div className="a-placeholder">Нет изображения</div>}
        <div className="a-image-field-actions">
          <button type="button" className="a-btn a-btn-sm" onClick={() => setOpen(true)}>
            <Icon name="image" size={15} /> {value ? "Заменить" : "Выбрать"}
          </button>
          {value && (
            <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={() => onChange(null)}>
              Убрать
            </button>
          )}
        </div>
      </div>
      {hint && <div className="a-hint">{hint}</div>}
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            onChange({ id: m.id, url: m.url, alt: m.alt });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/** Изображение в тексте страницы: хранится адрес файла */
export function ImageUrlField({ label, value, onChange, hint, error }: { label: string; value: string; onChange: (url: string) => void; hint?: string; error?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="a-image-field">
        {value ? <img src={value} alt="" /> : <div className="a-placeholder">Нет изображения</div>}
        <div className="a-image-field-actions">
          <button type="button" className="a-btn a-btn-sm" onClick={() => setOpen(true)}>
            <Icon name="image" size={15} /> {value ? "Заменить" : "Выбрать"}
          </button>
          {value && (
            <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={() => onChange("")}>
              Убрать
            </button>
          )}
        </div>
      </div>
      {error ? <div className="a-error-text">{error}</div> : hint && <div className="a-hint">{hint}</div>}
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            onChange(m.url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/** Галерея: несколько изображений с порядком */
export function GalleryField({ label, value, onChange, hint }: { label: string; value: MediaRef[]; onChange: (v: MediaRef[]) => void; hint?: string }) {
  const [open, setOpen] = useState(false);
  const moveItem = (i: number, d: number) => {
    const to = i + d;
    if (to < 0 || to >= value.length) return;
    const copy = value.slice();
    [copy[i], copy[to]] = [copy[to], copy[i]];
    onChange(copy);
  };
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      {value.length > 0 && (
        <div className="a-gallery-field" style={{ marginBottom: 10 }}>
          {value.map((m, i) => (
            <figure key={`${m.id}-${i}`}>
              <img src={m.url} alt={m.alt} />
              <div className="a-gallery-tools">
                <button type="button" className="a-icon-btn" disabled={i === 0} onClick={() => moveItem(i, -1)} aria-label="Левее">
                  <Icon name="back" size={14} />
                </button>
                <button type="button" className="a-icon-btn" disabled={i === value.length - 1} onClick={() => moveItem(i, 1)} aria-label="Правее">
                  <span style={{ transform: "scaleX(-1)", display: "inline-grid" }}>
                    <Icon name="back" size={14} />
                  </span>
                </button>
                <button type="button" className="a-icon-btn danger" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Убрать из галереи">
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
      <button type="button" className="a-btn a-btn-sm" onClick={() => setOpen(true)} disabled={value.length >= 40}>
        <Icon name="plus" size={15} /> Добавить изображение
      </button>
      {hint && <div className="a-hint">{hint}</div>}
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            onChange([...value, { id: m.id, url: m.url, alt: m.alt }]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
