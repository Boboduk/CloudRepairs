import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import type { PageSchema } from "../../../shared/schema";
import { Icon, Loader, MoveButtons, PageHead, TextInput, fieldErrors, formatDate, move, useToast, useUnsavedWarning } from "../ui";
import { SectionForm } from "../components/SchemaForm";

type Sections = Record<string, Record<string, unknown>>;
interface PageResponse {
  schema: PageSchema;
  sections: Sections;
  order: string[];
  seoTitle: string;
  seoDescription: string;
  updatedAt: string | null;
}

export default function PageEditPage() {
  const { key = "" } = useParams();
  const toast = useToast();
  const [data, setData] = useState<PageResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sections, setSections] = useState<Sections>({});
  const [order, setOrder] = useState<string[]>([]);
  const [seo, setSeo] = useState({ seoTitle: "", seoDescription: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useUnsavedWarning(dirty);

  const apply = (r: PageResponse) => {
    setData(r);
    setSections(r.sections);
    setOrder(r.order);
    setSeo({ seoTitle: r.seoTitle, seoDescription: r.seoDescription });
    setDirty(false);
  };

  useEffect(() => {
    setData(null);
    setNotFound(false);
    api
      .get<PageResponse>(`/pages/${encodeURIComponent(key)}`)
      .then(apply)
      .catch((e) => (e.status === 404 ? setNotFound(true) : toast.error(e)));
  }, [key, toast]);

  if (notFound) return <PageHead title="Страница не найдена" back={{ to: "/pages", label: "Тексты страниц" }} />;
  if (!data) return <Loader />;
  const { schema } = data;

  const save = async () => {
    setSaving(true);
    try {
      apply(await api.put<PageResponse>(`/pages/${key}`, { sections, order, ...seo }));
      setErrors({});
      toast.success("Страница сохранена — изменения уже на сайте");
    } catch (e) {
      const errs = fieldErrors(e, true);
      setErrors(errs);
      toast.error(e);
      const first = Object.keys(errs)[0]?.split(".")[0];
      if (first) document.getElementById(`section-${first}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setSaving(false);
    }
  };

  const labelOf = (k: string) => schema.sections.find((s) => s.key === k)?.label ?? k;
  const sectionHasError = (k: string) => Object.keys(errors).some((p) => p === k || p.startsWith(`${k}.`));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <PageHead
        title={`Страница «${schema.label}»`}
        sub={data.updatedAt ? `Последнее изменение: ${formatDate(data.updatedAt, true)}` : "Показывается исходный текст сайта"}
        back={{ to: "/pages", label: "Тексты страниц" }}
      >
        <a className="a-btn" href={schema.path} target="_blank" rel="noopener noreferrer">
          <Icon name="external" size={16} /> Открыть страницу
        </a>
      </PageHead>
      <div className="a-edit-layout">
        <div>
          {schema.sections.map((s) => (
            <section key={s.key} id={`section-${s.key}`} className="a-card a-card-pad" style={{ scrollMarginTop: 80 }}>
              <h2 className="a-card-title" style={sectionHasError(s.key) ? { color: "var(--a-red)" } : undefined}>
                {s.label}
              </h2>
              {s.help && <p className="a-card-help">{s.help}</p>}
              <SectionForm
                section={s}
                value={sections[s.key] ?? {}}
                errors={errors}
                onChange={(v) => {
                  setSections((x) => ({ ...x, [s.key]: v }));
                  setDirty(true);
                }}
              />
            </section>
          ))}
          <div className="a-card a-card-pad">
            <h2 className="a-card-title">SEO страницы</h2>
            <TextInput label="SEO-заголовок (title)" value={seo.seoTitle} onChange={(v) => (setSeo((x) => ({ ...x, seoTitle: v })), setDirty(true))} max={200} error={errors.seoTitle} />
            <TextInput
              label="SEO-описание (description)"
              value={seo.seoDescription}
              onChange={(v) => (setSeo((x) => ({ ...x, seoDescription: v })), setDirty(true))}
              max={400}
              multiline
              error={errors.seoDescription}
            />
          </div>
          <div className="a-savebar">
            <span>{dirty ? "Есть несохранённые изменения" : "Все изменения сохранены"}</span>
            <button type="submit" className="a-btn a-btn-lime" disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить страницу"}
            </button>
          </div>
        </div>
        <div className="a-edit-side">
          <div className="a-card a-card-pad">
            <h2 className="a-card-title">Разделы</h2>
            <nav className="a-section-nav" aria-label="Разделы страницы">
              {schema.sections.map((s) => (
                <a
                  key={s.key}
                  href={`#section-${s.key}`}
                  style={sectionHasError(s.key) ? { color: "var(--a-red)" } : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`section-${s.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
          {schema.orderable.length > 1 && (
            <div className="a-card a-card-pad">
              <h2 className="a-card-title">Порядок блоков</h2>
              <p className="a-card-help">Первый экран и заключительный блок всегда остаются на своих местах.</p>
              <ol className="a-order-list" data-testid="section-order">
                {order.map((k, i) => (
                  <li key={k}>
                    <span>{labelOf(k)}</span>
                    <MoveButtons
                      index={i}
                      length={order.length}
                      label={labelOf(k)}
                      onMove={(d) => {
                        setOrder(move(order, i, d));
                        setDirty(true);
                      }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
