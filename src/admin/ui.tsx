import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { errorText } from "./api";

// ---------- Иконки ----------
const PATHS = {
  dashboard: "M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z",
  news: "M4 5h13v14H5a1 1 0 0 1-1-1zM17 9h3v9a1 1 0 0 1-2 0M7 9h7M7 13h7M7 16h4",
  partners: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 2.7-5 6-5s6 2 6 5M14 15.3c.6-.2 1.3-.3 2-.3 3.3 0 6 2 6 5",
  cases: "M3 8h18v12H3zM8 8V5h8v3M3 13h18",
  products: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 8v5M21 8v5",
  pages: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7",
  media: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9.5a1.5 1.5 0 1 0 0-.01",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
  up: "M12 19V5M5 12l7-7 7 7",
  down: "M12 5v14M19 12l-7 7-7-7",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff: "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.5 4.6-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  close: "M6 6l12 12M18 6L6 18",
  menu: "M4 6h16M4 12h16M4 18h16",
  upload: "M12 16V4M7 9l5-5 5 5M4 16v4h16v-4",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  back: "M15 18l-6-6 6-6",
  image: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5",
  replace: "M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4",
  check: "M5 12l5 5 9-10",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
} as const;
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

// ---------- Уведомления ----------
interface Toast {
  id: number;
  text: string;
  kind: "success" | "error";
}
interface ToastApi {
  success: (text: string) => void;
  error: (e: unknown) => void;
}
const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const push = useCallback((text: string, kind: Toast["kind"]) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-3), { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 8000 : 3500);
  }, []);
  const [apiValue] = useState<ToastApi>(() => ({
    success: (text) => push(text, "success"),
    error: (e) => push(typeof e === "string" ? e : errorText(e), "error"),
  }));
  return (
    <ToastContext.Provider value={apiValue}>
      {children}
      <div className="a-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast ${t.kind}`} data-testid={`toast-${t.kind}`}>
            <span>{t.text}</span>
            <button type="button" aria-label="Закрыть" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastProvider не подключен");
  return ctx;
}

// ---------- Модальное окно ----------
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>("input, textarea, select, button:not([data-close])");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="a-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`a-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="a-modal-head">
          <h2>{title}</h2>
          <button type="button" className="a-icon-btn" data-close onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="a-modal-body">{children}</div>
        {footer && <div className="a-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Подтверждение ----------
interface ConfirmOptions {
  title: string;
  text: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}
const ConfirmContext = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...o, resolve })), []);
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal
          title={state.title}
          onClose={() => close(false)}
          footer={
            <>
              <button type="button" className="a-btn" onClick={() => close(false)}>
                Отмена
              </button>
              <button type="button" className={`a-btn ${state.danger !== false ? "a-btn-danger-solid" : "a-btn-primary"}`} onClick={() => close(true)} data-testid="confirm-ok">
                {state.confirmLabel ?? "Удалить"}
              </button>
            </>
          }
        >
          <div>{state.text}</div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("ConfirmProvider не подключен");
  return ctx;
}

// ---------- Поля формы ----------
export function Field({
  label,
  hint,
  error,
  required,
  counter,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  counter?: { value: number; max: number };
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="a-field">
      <label className="a-label" htmlFor={htmlFor}>
        {label}
        {required && <span className="req"> *</span>}
        {counter && (
          <span className="a-counter" style={counter.value > counter.max ? { color: "var(--a-red)" } : undefined}>
            {counter.value}/{counter.max}
          </span>
        )}
      </label>
      {children}
      {error ? <div className="a-error-text">{error}</div> : hint ? <div className="a-hint">{hint}</div> : null}
    </div>
  );
}

let idSeq = 0;
export function useFieldId(prefix = "f") {
  const [id] = useState(() => `${prefix}-${++idSeq}`);
  return id;
}

export function TextInput({
  label,
  value,
  onChange,
  max,
  required,
  hint,
  error,
  multiline,
  rows,
  placeholder,
  type = "text",
  name,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
  name?: string;
}) {
  const id = useFieldId();
  const common = {
    id,
    name,
    value,
    placeholder,
    required,
    "aria-invalid": error ? ("true" as const) : undefined,
    maxLength: max ? max + 200 : undefined,
  };
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} counter={max ? { value: value.length, max } : undefined}>
      {multiline ? (
        <textarea className="a-textarea" rows={rows ?? 3} {...common} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="a-input" type={type} {...common} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" | "hidden" | "visible" }) {
  const map = {
    published: ["a-badge-published", "Опубликовано"],
    visible: ["a-badge-published", "Показан"],
    draft: ["a-badge-draft", "Черновик"],
    hidden: ["a-badge-hidden", "Скрыт"],
  } as const;
  const [cls, text] = map[status];
  return <span className={`a-badge ${cls}`}>{text}</span>;
}

export function StatusSwitch({ value, onChange }: { value: "draft" | "published"; onChange: (v: "draft" | "published") => void }) {
  return (
    <div className="a-status-switch" role="radiogroup" aria-label="Статус">
      <label>
        <input type="radio" name="status" checked={value === "draft"} onChange={() => onChange("draft")} />
        Черновик
      </label>
      <label>
        <input type="radio" name="status" checked={value === "published"} onChange={() => onChange("published")} />
        Опубликовано
      </label>
    </div>
  );
}

export function PageHead({ title, sub, back, children }: { title: string; sub?: ReactNode; back?: { to: string; label: string }; children?: ReactNode }) {
  useEffect(() => {
    document.title = `${title} — админ-панель CloudRepairs`;
  }, [title]);
  return (
    <div className="a-page-head">
      <div>
        {back && (
          <Link to={back.to} className="a-crumb">
            <Icon name="back" size={14} /> {back.label}
          </Link>
        )}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="a-actions">{children}</div>}
    </div>
  );
}

export function Loader({ text = "Загрузка…" }: { text?: string }) {
  return <div className="a-loader">{text}</div>;
}

export function Thumb({ src, alt = "" }: { src?: string | null; alt?: string }) {
  return src ? (
    <img className="a-thumb" src={src} alt={alt} loading="lazy" />
  ) : (
    <span className="a-thumb a-thumb-empty">
      <Icon name="image" size={16} />
    </span>
  );
}

export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("ru-RU", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

/** Перемещение элемента массива (для кнопок «вверх/вниз») */
export function move<T>(arr: T[], index: number, delta: number): T[] {
  const to = index + delta;
  if (to < 0 || to >= arr.length) return arr;
  const copy = arr.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function MoveButtons({ index, length, onMove, label }: { index: number; length: number; onMove: (delta: number) => void; label: string }) {
  return (
    <>
      <button type="button" className="a-icon-btn" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Поднять: ${label}`} title="Выше">
        <Icon name="up" size={15} />
      </button>
      <button type="button" className="a-icon-btn" disabled={index === length - 1} onClick={() => onMove(1)} aria-label={`Опустить: ${label}`} title="Ниже">
        <Icon name="down" size={15} />
      </button>
    </>
  );
}

/** Предупреждение при уходе со страницы с несохранёнными изменениями */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}

/** Ошибки валидации сервера по полям: { field: message } */
export function fieldErrors(e: unknown, fullPath = false): Record<string, string> {
  const out: Record<string, string> = {};
  const details = (e as { details?: unknown })?.details;
  if (Array.isArray(details)) {
    for (const d of details as { path?: string | (string | number)[]; message?: string }[]) {
      const raw = Array.isArray(d.path) ? d.path.join(".") : String(d.path ?? "");
      const key = fullPath ? raw : raw.split(".")[0];
      if (key && d.message && !out[key]) out[key] = d.message;
    }
  }
  return out;
}

/** Адрес публичной страницы (для ссылки «Открыть на сайте») */
export function publicUrl(path: string) {
  return path;
}
