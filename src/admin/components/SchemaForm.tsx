import type { Field, SectionSchema } from "../../../shared/schema";
import { Icon, MoveButtons, TextInput, move, useFieldId } from "../ui";
import { ImageUrlField } from "./Media";
import { RichTextEditor } from "./RichTextEditor";

/**
 * Форма секции страницы, построенная по схеме из shared/schema.ts.
 * Редактируются только тексты, изображения, ссылки и элементы списков — вёрстка не меняется.
 */

type Obj = Record<string, unknown>;
type Errors = Record<string, string>;

export function SectionForm({ section, value, onChange, errors }: { section: SectionSchema; value: Obj; onChange: (v: Obj) => void; errors: Errors }) {
  return <FieldsForm fields={section.fields} value={value} onChange={onChange} path={section.key} errors={errors} />;
}

function FieldsForm({ fields, value, onChange, path, errors }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void; path: string; errors: Errors }) {
  return (
    <>
      {fields.map((f) => (
        <FieldInput key={f.key} field={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} path={`${path}.${f.key}`} errors={errors} />
      ))}
    </>
  );
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

function FieldInput({ field, value, onChange, path, errors }: { field: Field; value: unknown; onChange: (v: unknown) => void; path: string; errors: Errors }) {
  const error = errors[path];
  const selectId = useFieldId("sel");
  switch (field.type) {
    case "text":
    case "textarea":
      return (
        <TextInput
          label={field.label}
          value={str(value)}
          onChange={onChange}
          max={field.max ?? 300}
          required={field.required}
          hint={field.help}
          error={error}
          multiline={field.type === "textarea"}
          rows={field.type === "textarea" ? 4 : undefined}
        />
      );
    case "url":
      return <TextInput label={field.label} value={str(value)} onChange={onChange} hint={field.help ?? "Например: /about/, #ceny, https://…, mailto:…"} error={error} placeholder="/страница/ или https://…" />;
    case "richtext":
      return (
        <div className="a-field">
          <span className="a-label">{field.label}</span>
          <RichTextEditor label={field.label} value={str(value)} onChange={onChange} minHeight={160} />
          {error && <div className="a-error-text">{error}</div>}
        </div>
      );
    case "image":
      return <ImageUrlField label={field.label} value={str(value)} onChange={onChange} hint={field.help} error={error} />;
    case "select":
      return (
        <div className="a-field">
          <label className="a-label" htmlFor={selectId}>
            {field.label}
          </label>
          <select id={selectId} className="a-select" value={str(value)} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "strings":
      return <StringsInput field={field} value={Array.isArray(value) ? value.map(str) : []} onChange={onChange} error={error} />;
    case "items":
      return <ItemsInput field={field} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} path={path} errors={errors} />;
  }
}

function StringsInput({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<Field, { type: "strings" }>;
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const max = field.max ?? 60;
  const itemLabel = field.itemLabel ?? "Пункт";
  return (
    <div className="a-field">
      <span className="a-label">{field.label}</span>
      <div className="a-list-editor">
        {value.map((s, i) => (
          <div key={i} className="a-list-row">
            {field.multiline ? (
              <textarea className="a-textarea" rows={1} value={s} aria-label={`${itemLabel} ${i + 1}`} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <input className="a-input" value={s} aria-label={`${itemLabel} ${i + 1}`} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            )}
            <div className="a-row-tools">
              <MoveButtons index={i} length={value.length} onMove={(d) => onChange(move(value, i, d))} label={`${itemLabel} ${i + 1}`} />
              <button type="button" className="a-icon-btn danger" aria-label={`Удалить: ${itemLabel} ${i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="a-btn a-btn-sm" style={{ marginTop: 8 }} disabled={value.length >= max} onClick={() => onChange([...value, ""])}>
        <Icon name="plus" size={15} /> Добавить: {itemLabel.toLowerCase()}
      </button>
      {error && <div className="a-error-text">{error}</div>}
      <div className="a-hint">Пустые пункты при сохранении удаляются.</div>
    </div>
  );
}

function emptyItem(fields: Field[]): Obj {
  const o: Obj = {};
  for (const f of fields) o[f.key] = f.type === "strings" || f.type === "items" ? [] : f.type === "select" ? f.options[0]?.value ?? "" : "";
  return o;
}

function ItemsInput({
  field,
  value,
  onChange,
  path,
  errors,
}: {
  field: Extract<Field, { type: "items" }>;
  value: Obj[];
  onChange: (v: Obj[]) => void;
  path: string;
  errors: Errors;
}) {
  const max = field.max ?? 60;
  const hasError = (i: number) => Object.keys(errors).some((k) => k.startsWith(`${path}[${i}]`));
  return (
    <div className="a-field">
      <span className="a-label">
        {field.label} <span style={{ fontWeight: 400, color: "var(--a-faint)" }}>({value.length})</span>
      </span>
      <div className="a-items">
        {value.map((item, i) => {
          const title = field.titleKey ? str(item[field.titleKey]) : "";
          return (
            <details key={i} className="a-item" open={hasError(i) || undefined}>
              <summary>
                <span className="a-item-num">{i + 1}.</span>
                <span className="a-item-title" style={hasError(i) ? { color: "var(--a-red)" } : undefined}>
                  {title || `${field.itemLabel} без названия`}
                </span>
                <span className="a-row-tools" onClick={(e) => e.preventDefault()}>
                  <MoveButtons index={i} length={value.length} onMove={(d) => onChange(move(value, i, d))} label={title || `${field.itemLabel} ${i + 1}`} />
                  <button
                    type="button"
                    className="a-icon-btn danger"
                    aria-label={`Удалить: ${title || field.itemLabel}`}
                    onClick={() => {
                      if (window.confirm(`Удалить «${title || field.itemLabel}»? Изменение применится после сохранения страницы.`)) onChange(value.filter((_, j) => j !== i));
                    }}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </span>
              </summary>
              <div className="a-item-body">
                <FieldsForm fields={field.fields} value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} path={`${path}[${i}]`} errors={errors} />
              </div>
            </details>
          );
        })}
      </div>
      <button type="button" className="a-btn a-btn-sm" style={{ marginTop: 8 }} disabled={value.length >= max} onClick={() => onChange([...value, emptyItem(field.fields)])}>
        <Icon name="plus" size={15} /> Добавить: {field.itemLabel.toLowerCase()}
      </button>
    </div>
  );
}
