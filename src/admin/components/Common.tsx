import type { ReactNode } from "react";
import { Icon, TextInput, useFieldId } from "../ui";

/** SEO-поля записи с подсказкой о значениях по умолчанию */
export function SeoFields({
  title,
  description,
  onChange,
  errors,
  fallbackTitle,
}: {
  title: string;
  description: string;
  onChange: (patch: { seoTitle?: string; seoDescription?: string }) => void;
  errors: Record<string, string>;
  fallbackTitle?: string;
}) {
  return (
    <div className="a-card a-card-pad">
      <h2 className="a-card-title">SEO</h2>
      <p className="a-card-help">Заголовок и описание для поисковых систем и превью в мессенджерах. Если не заполнены, используются название и краткое описание.</p>
      <TextInput label="SEO-заголовок" value={title} onChange={(v) => onChange({ seoTitle: v })} max={200} error={errors.seoTitle} placeholder={fallbackTitle} />
      <TextInput label="SEO-описание" value={description} onChange={(v) => onChange({ seoDescription: v })} max={400} multiline rows={3} error={errors.seoDescription} />
    </div>
  );
}

/** Поле адреса страницы (slug) */
export function SlugField({ value, onChange, prefix, error }: { value: string; onChange: (v: string) => void; prefix: string; error?: string }) {
  const id = useFieldId("slug");
  return (
    <div className="a-field">
      <label className="a-label" htmlFor={id}>
        Адрес страницы (slug)
      </label>
      <div className="a-inline">
        <span style={{ color: "var(--a-muted)", fontSize: 13.5, whiteSpace: "nowrap" }}>{prefix}</span>
        <input
          id={id}
          className="a-input"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"))}
          placeholder="создаётся из заголовка"
          aria-invalid={error ? "true" : undefined}
          maxLength={80}
        />
      </div>
      {error ? <div className="a-error-text">{error}</div> : <div className="a-hint">Латиница, цифры и дефисы. Оставьте пустым — адрес создастся из заголовка автоматически.</div>}
    </div>
  );
}

/** Ссылка на публичную страницу записи */
export function PublicLink({ href, children = "Открыть на сайте" }: { href: string | null; children?: ReactNode }) {
  if (!href) return null;
  return (
    <a className="a-btn" href={href} target="_blank" rel="noopener noreferrer">
      <Icon name="external" size={16} /> {children}
    </a>
  );
}

/** Подсказка о статусе публикации */
export function PublishHint({ status, hasBody, noun }: { status: "draft" | "published"; hasBody?: boolean; noun: string }) {
  if (status === "draft") return <div className="a-hint">Черновик не виден посетителям сайта.</div>;
  if (hasBody === false) return <div className="a-hint">{noun} показывается на сайте карточкой; отдельная страница появится, когда будет заполнен полный текст.</div>;
  return <div className="a-hint">Запись видна на сайте.</div>;
}
