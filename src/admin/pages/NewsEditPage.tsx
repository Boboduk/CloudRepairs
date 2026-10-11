import { useParams } from "react-router-dom";
import type { MediaRef, NewsDto, Status } from "../api";
import { Loader, PageHead, StatusSwitch, TextInput, useConfirm, useFieldId, useToast } from "../ui";
import { ImageField } from "../components/Media";
import { RichTextEditor } from "../components/RichTextEditor";
import { PublicLink, SeoFields, SlugField } from "../components/Common";
import { useEntityForm } from "../components/useEntityForm";
import { isoToLocalInput, localInputToIso } from "../components/dates";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

interface Form {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover: MediaRef | null;
  publishedAt: string; // datetime-local
  status: Status;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY: Form = { title: "", slug: "", excerpt: "", body: "", cover: null, publishedAt: "", status: "draft", seoTitle: "", seoDescription: "" };

const fromDto = (d: NewsDto): Form => ({
  title: d.title,
  slug: d.slug,
  excerpt: d.excerpt,
  body: d.body ?? "",
  cover: d.cover,
  publishedAt: isoToLocalInput(d.publishedAt),
  status: d.status,
  seoTitle: d.seoTitle,
  seoDescription: d.seoDescription,
});

const toPayload = (f: Form) => ({
  title: f.title,
  slug: f.slug,
  excerpt: f.excerpt,
  body: f.body,
  coverId: f.cover?.id ?? null,
  publishedAt: localInputToIso(f.publishedAt),
  status: f.status,
  seoTitle: f.seoTitle,
  seoDescription: f.seoDescription,
});

export default function NewsEditPage() {
  const { id } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const dateId = useFieldId("date");
  const { form, set, save, dto, loading, notFound, saving, errors, dirty, isNew } = useEntityForm<Form, NewsDto>({
    endpoint: "/news",
    listPath: "/news",
    id,
    empty: EMPTY,
    fromDto,
    toPayload,
    savedText: "Новость сохранена",
  });

  if (loading) return <Loader />;
  if (notFound)
    return (
      <>
        <PageHead title="Новость не найдена" back={{ to: "/news", label: "Все новости" }} />
      </>
    );

  const future = form.status === "published" && form.publishedAt && new Date(form.publishedAt) > new Date();
  const remove = async () => {
    if (!dto || !(await confirm({ title: "Удалить новость?", text: <>Новость «{dto.title}» будет удалена без возможности восстановления.</> }))) return;
    try {
      await api.del(`/news/${dto.id}`);
      toast.success("Новость удалена");
      navigate("/news");
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
    >
      <PageHead title={isNew ? "Новая новость" : "Редактирование новости"} back={{ to: "/news", label: "Все новости" }}>
        {dto?.status === "published" && <PublicLink href={`/news/${dto.slug}/`} />}
        {!isNew && (
          <button type="button" className="a-btn a-btn-danger" onClick={remove}>
            Удалить
          </button>
        )}
      </PageHead>
      <div className="a-edit-layout">
        <div>
          <div className="a-card a-card-pad">
            <TextInput label="Заголовок" value={form.title} onChange={(v) => set({ title: v })} max={300} required error={errors.title} name="title" />
            <SlugField value={form.slug} onChange={(v) => set({ slug: v })} prefix="/news/" error={errors.slug} />
            <TextInput
              label="Краткое описание"
              value={form.excerpt}
              onChange={(v) => set({ excerpt: v })}
              max={1000}
              multiline
              rows={3}
              error={errors.excerpt}
              hint="Показывается в карточке новости и в списке."
              name="excerpt"
            />
            <div className="a-field">
              <span className="a-label">Текст новости</span>
              <RichTextEditor label="Текст новости" value={form.body} onChange={(v) => set({ body: v })} />
              {errors.body && <div className="a-error-text">{errors.body}</div>}
            </div>
          </div>
          <SeoFields title={form.seoTitle} description={form.seoDescription} onChange={set} errors={errors} fallbackTitle={form.title} />
        </div>
        <div className="a-edit-side">
          <div className="a-card a-card-pad">
            <h2 className="a-card-title">Публикация</h2>
            <div className="a-field">
              <StatusSwitch value={form.status} onChange={(v) => set({ status: v })} />
              <div className="a-hint">{form.status === "draft" ? "Черновик не виден посетителям сайта." : future ? "Новость появится на сайте в указанную дату." : "Новость видна на сайте."}</div>
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor={dateId}>
                Дата публикации
              </label>
              <input id={dateId} type="datetime-local" className="a-input" value={form.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} aria-invalid={errors.publishedAt ? "true" : undefined} />
              {errors.publishedAt ? <div className="a-error-text">{errors.publishedAt}</div> : <div className="a-hint">Если не указана — будет поставлена в момент публикации.</div>}
            </div>
            <button type="submit" className="a-btn a-btn-primary" style={{ width: "100%" }} disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
            {dirty && <div className="a-hint" style={{ textAlign: "center" }}>Есть несохранённые изменения</div>}
          </div>
          <div className="a-card a-card-pad">
            <ImageField label="Обложка" value={form.cover} onChange={(m) => set({ cover: m })} hint="Показывается в карточке и вверху страницы новости." />
          </div>
        </div>
      </div>
    </form>
  );
}
