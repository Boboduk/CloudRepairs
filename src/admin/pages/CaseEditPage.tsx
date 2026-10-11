import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type CaseDto, type MediaRef, type PartnerDto, type Status } from "../api";
import { Icon, Loader, MoveButtons, PageHead, StatusSwitch, TextInput, move, useConfirm, useFieldId, useToast } from "../ui";
import { GalleryField, ImageField } from "../components/Media";
import { RichTextEditor } from "../components/RichTextEditor";
import { PublicLink, SeoFields, SlugField } from "../components/Common";
import { useEntityForm } from "../components/useEntityForm";

interface Form {
  title: string;
  slug: string;
  client: string;
  partnerId: number | null;
  excerpt: string;
  body: string;
  cover: MediaRef | null;
  images: MediaRef[];
  links: { label: string; href: string }[];
  status: Status;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY: Form = { title: "", slug: "", client: "", partnerId: null, excerpt: "", body: "", cover: null, images: [], links: [], status: "draft", seoTitle: "", seoDescription: "" };

const fromDto = (d: CaseDto): Form => ({
  title: d.title,
  slug: d.slug,
  client: d.client,
  partnerId: d.partnerId,
  excerpt: d.excerpt,
  body: d.body ?? "",
  cover: d.cover,
  images: d.images,
  links: d.links,
  status: d.status,
  seoTitle: d.seoTitle,
  seoDescription: d.seoDescription,
});

const toPayload = (f: Form) => ({
  title: f.title,
  slug: f.slug,
  client: f.client,
  partnerId: f.partnerId,
  excerpt: f.excerpt,
  body: f.body,
  coverId: f.cover?.id ?? null,
  imageIds: f.images.map((m) => m.id),
  links: f.links.filter((l) => l.label.trim() || l.href.trim()),
  status: f.status,
  seoTitle: f.seoTitle,
  seoDescription: f.seoDescription,
});

export default function CaseEditPage() {
  const { id } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const partnerSelect = useFieldId("partner");
  const [partners, setPartners] = useState<PartnerDto[]>([]);
  const { form, set, save, dto, loading, notFound, saving, errors, dirty, isNew } = useEntityForm<Form, CaseDto>({
    endpoint: "/cases",
    listPath: "/cases",
    id,
    empty: EMPTY,
    fromDto,
    toPayload,
    savedText: "Кейс сохранён",
  });

  useEffect(() => {
    api.get<PartnerDto[]>("/partners").then(setPartners).catch(toast.error);
  }, [toast]);

  if (loading) return <Loader />;
  if (notFound) return <PageHead title="Кейс не найден" back={{ to: "/cases", label: "Все кейсы" }} />;

  const remove = async () => {
    if (!dto || !(await confirm({ title: "Удалить кейс?", text: <>Кейс «{dto.title}» будет удалён без возможности восстановления.</> }))) return;
    try {
      await api.del(`/cases/${dto.id}`);
      toast.success("Кейс удалён");
      navigate("/cases");
    } catch (e) {
      toast.error(e);
    }
  };
  const setLink = (i: number, patch: Partial<Form["links"][number]>) => set({ links: form.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const hasPage = !!dto?.body?.trim();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <PageHead title={isNew ? "Новый кейс" : "Редактирование кейса"} back={{ to: "/cases", label: "Все кейсы" }}>
        {dto?.status === "published" && <PublicLink href={hasPage ? `/cases/${dto.slug}/` : "/#cases"} />}
        {!isNew && (
          <button type="button" className="a-btn a-btn-danger" onClick={remove}>
            Удалить
          </button>
        )}
      </PageHead>
      <div className="a-edit-layout">
        <div>
          <div className="a-card a-card-pad">
            <TextInput label="Название кейса" value={form.title} onChange={(v) => set({ title: v })} required max={300} error={errors.title} name="title" />
            <SlugField value={form.slug} onChange={(v) => set({ slug: v })} prefix="/cases/" error={errors.slug} />
            <div className="a-grid-2">
              <TextInput label="Клиент" value={form.client} onChange={(v) => set({ client: v })} max={200} error={errors.client} />
              <div className="a-field">
                <label className="a-label" htmlFor={partnerSelect}>
                  Партнёр
                </label>
                <select id={partnerSelect} className="a-select" value={form.partnerId ?? ""} onChange={(e) => set({ partnerId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">— не выбран —</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.visible ? "" : " (скрыт)"}
                    </option>
                  ))}
                </select>
                {errors.partnerId && <div className="a-error-text">{errors.partnerId}</div>}
              </div>
            </div>
            <TextInput label="Краткое описание" value={form.excerpt} onChange={(v) => set({ excerpt: v })} multiline max={1000} error={errors.excerpt} hint="Показывается в карточке кейса на главной странице." />
            <div className="a-field">
              <span className="a-label">Полное описание</span>
              <RichTextEditor label="Полное описание кейса" value={form.body} onChange={(v) => set({ body: v })} />
              <div className="a-hint">Если заполнено, у кейса появится отдельная страница, а карточка станет ссылкой.</div>
            </div>
          </div>
          <div className="a-card a-card-pad">
            <h2 className="a-card-title">Связанные ссылки</h2>
            <div className="a-list-editor">
              {form.links.map((l, i) => (
                <div key={i} className="a-list-row">
                  <input className="a-input" placeholder="Текст ссылки" value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} aria-label={`Текст ссылки ${i + 1}`} />
                  <input className="a-input" placeholder="https://… или /страница/" value={l.href} onChange={(e) => setLink(i, { href: e.target.value })} aria-label={`Адрес ссылки ${i + 1}`} />
                  <div className="a-row-tools">
                    <MoveButtons index={i} length={form.links.length} onMove={(d) => set({ links: move(form.links, i, d) })} label={l.label || `ссылка ${i + 1}`} />
                    <button type="button" className="a-icon-btn danger" aria-label="Удалить ссылку" onClick={() => set({ links: form.links.filter((_, j) => j !== i) })}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {Object.entries(errors)
              .filter(([k]) => k === "links")
              .map(([k, v]) => (
                <div key={k} className="a-error-text">
                  {v}
                </div>
              ))}
            <button type="button" className="a-btn a-btn-sm" style={{ marginTop: 8 }} disabled={form.links.length >= 20} onClick={() => set({ links: [...form.links, { label: "", href: "" }] })}>
              <Icon name="plus" size={15} /> Добавить ссылку
            </button>
          </div>
          <SeoFields title={form.seoTitle} description={form.seoDescription} onChange={set} errors={errors} fallbackTitle={form.title} />
        </div>
        <div className="a-edit-side">
          <div className="a-card a-card-pad">
            <h2 className="a-card-title">Публикация</h2>
            <div className="a-field">
              <StatusSwitch value={form.status} onChange={(v) => set({ status: v })} />
              <div className="a-hint">{form.status === "draft" ? "Черновик не виден посетителям сайта." : "Кейс показывается в блоке «Кейсы»."}</div>
            </div>
            <button type="submit" className="a-btn a-btn-primary" style={{ width: "100%" }} disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
            {dirty && <div className="a-hint" style={{ textAlign: "center" }}>Есть несохранённые изменения</div>}
          </div>
          <div className="a-card a-card-pad">
            <ImageField label="Обложка" value={form.cover} onChange={(m) => set({ cover: m })} />
            <GalleryField label="Дополнительные изображения" value={form.images} onChange={(v) => set({ images: v })} hint="Галерея на странице кейса." />
          </div>
        </div>
      </div>
    </form>
  );
}
