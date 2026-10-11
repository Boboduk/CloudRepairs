import { useNavigate, useParams } from "react-router-dom";
import { api, type MediaRef, type ProductDto, type Status } from "../api";
import { Loader, PageHead, StatusSwitch, TextInput, useConfirm, useToast } from "../ui";
import { ImageField } from "../components/Media";
import { RichTextEditor } from "../components/RichTextEditor";
import { PublicLink, SeoFields, SlugField } from "../components/Common";
import { useEntityForm } from "../components/useEntityForm";

interface Form {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image: MediaRef | null;
  linkUrl: string;
  linkLabel: string;
  status: Status;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY: Form = { title: "", slug: "", excerpt: "", body: "", image: null, linkUrl: "", linkLabel: "", status: "draft", seoTitle: "", seoDescription: "" };

const fromDto = (d: ProductDto): Form => ({
  title: d.title,
  slug: d.slug,
  excerpt: d.excerpt,
  body: d.body ?? "",
  image: d.image,
  linkUrl: d.linkUrl,
  linkLabel: d.linkLabel,
  status: d.status,
  seoTitle: d.seoTitle,
  seoDescription: d.seoDescription,
});

const toPayload = (f: Form) => ({
  title: f.title,
  slug: f.slug,
  excerpt: f.excerpt,
  body: f.body,
  imageId: f.image?.id ?? null,
  linkUrl: f.linkUrl,
  linkLabel: f.linkLabel,
  status: f.status,
  seoTitle: f.seoTitle,
  seoDescription: f.seoDescription,
});

export default function ProductEditPage() {
  const { id } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { form, set, save, dto, loading, notFound, saving, errors, dirty, isNew } = useEntityForm<Form, ProductDto>({
    endpoint: "/products",
    listPath: "/products",
    id,
    empty: EMPTY,
    fromDto,
    toPayload,
    savedText: "Продукт сохранён",
  });

  if (loading) return <Loader />;
  if (notFound) return <PageHead title="Продукт не найден" back={{ to: "/products", label: "Все продукты" }} />;

  const remove = async () => {
    if (!dto || !(await confirm({ title: "Удалить продукт?", text: <>Продукт «{dto.title}» будет удалён без возможности восстановления.</> }))) return;
    try {
      await api.del(`/products/${dto.id}`);
      toast.success("Продукт удалён");
      navigate("/products");
    } catch (e) {
      toast.error(e);
    }
  };
  const publicHref = dto?.status === "published" ? dto.linkUrl || (dto.body?.trim() ? `/products/${dto.slug}/` : "/#products") : null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <PageHead title={isNew ? "Новый продукт" : "Редактирование продукта"} back={{ to: "/products", label: "Все продукты" }}>
        <PublicLink href={publicHref} />
        {!isNew && (
          <button type="button" className="a-btn a-btn-danger" onClick={remove}>
            Удалить
          </button>
        )}
      </PageHead>
      <div className="a-edit-layout">
        <div>
          <div className="a-card a-card-pad">
            <TextInput label="Название" value={form.title} onChange={(v) => set({ title: v })} required max={200} error={errors.title} name="title" />
            <SlugField value={form.slug} onChange={(v) => set({ slug: v })} prefix="/products/" error={errors.slug} />
            <TextInput label="Краткое описание" value={form.excerpt} onChange={(v) => set({ excerpt: v })} multiline max={1000} error={errors.excerpt} hint="Текст карточки на главной странице." />
            <div className="a-field">
              <span className="a-label">Подробное описание</span>
              <RichTextEditor label="Подробное описание продукта" value={form.body} onChange={(v) => set({ body: v })} />
              <div className="a-hint">Если заполнено и не указана ссылка карточки, у продукта появится отдельная страница.</div>
            </div>
          </div>
          <div className="a-card a-card-pad">
            <h2 className="a-card-title">Ссылка карточки</h2>
            <p className="a-card-help">Куда ведёт карточка продукта на главной странице. Например, на страницу продукта /vnutyankaya-training/.</p>
            <div className="a-grid-2">
              <TextInput label="Адрес" value={form.linkUrl} onChange={(v) => set({ linkUrl: v })} error={errors.linkUrl} placeholder="/страница/ или https://…" />
              <TextInput label="Текст ссылки" value={form.linkLabel} onChange={(v) => set({ linkLabel: v })} max={100} error={errors.linkLabel} placeholder="Подробнее" />
            </div>
          </div>
          <SeoFields title={form.seoTitle} description={form.seoDescription} onChange={set} errors={errors} fallbackTitle={form.title} />
        </div>
        <div className="a-edit-side">
          <div className="a-card a-card-pad">
            <h2 className="a-card-title">Публикация</h2>
            <div className="a-field">
              <StatusSwitch value={form.status} onChange={(v) => set({ status: v })} />
              <div className="a-hint">{form.status === "draft" ? "Черновик не виден посетителям сайта." : "Продукт показывается на главной странице."}</div>
            </div>
            <button type="submit" className="a-btn a-btn-primary" style={{ width: "100%" }} disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
            {dirty && <div className="a-hint" style={{ textAlign: "center" }}>Есть несохранённые изменения</div>}
          </div>
          <div className="a-card a-card-pad">
            <ImageField label="Изображение" value={form.image} onChange={(m) => set({ image: m })} hint="Показывается в карточке продукта." />
          </div>
        </div>
      </div>
    </form>
  );
}
