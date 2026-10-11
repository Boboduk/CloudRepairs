import { useEffect, useState } from "react";
import { api, type MediaRef, type PartnerDto } from "../api";
import { Icon, Loader, Modal, MoveButtons, PageHead, StatusBadge, TextInput, Thumb, fieldErrors, move, useConfirm, useToast } from "../ui";
import { ImageField } from "../components/Media";

interface Form {
  id: number | null;
  name: string;
  url: string;
  description: string;
  logo: MediaRef | null;
  visible: boolean;
}

export default function PartnersPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<PartnerDto[] | null>(null);
  const [edit, setEdit] = useState<Form | null>(null);

  useEffect(() => {
    api.get<PartnerDto[]>("/partners").then(setItems).catch(toast.error);
  }, [toast]);

  const replace = (p: PartnerDto) => setItems((list) => (list ? (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p]) : [p]));

  const toggle = async (p: PartnerDto) => {
    try {
      replace(await api.patch<PartnerDto>(`/partners/${p.id}/visibility`, { visible: !p.visible }));
      toast.success(p.visible ? "Партнёр скрыт с сайта" : "Партнёр показан на сайте");
    } catch (e) {
      toast.error(e);
    }
  };

  const reorder = async (index: number, delta: number) => {
    if (!items) return;
    const next = move(items, index, delta);
    const prev = items;
    setItems(next);
    try {
      await api.post("/partners/reorder", { ids: next.map((p) => p.id) });
      toast.success("Порядок сохранён");
    } catch (e) {
      setItems(prev);
      toast.error(e);
    }
  };

  const remove = async (p: PartnerDto) => {
    if (!(await confirm({ title: "Удалить партнёра?", text: <>Партнёр «{p.name}» будет удалён. Кейсы, связанные с ним, останутся, но потеряют связь.</> }))) return;
    try {
      await api.del(`/partners/${p.id}`);
      setItems((list) => list?.filter((x) => x.id !== p.id) ?? null);
      toast.success("Партнёр удалён");
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <>
      <PageHead title="Партнёры" sub="Логотипы и названия партнёров в блоке «Партнёры» на главной странице и на странице «О нас».">
        <button type="button" className="a-btn a-btn-lime" onClick={() => setEdit({ id: null, name: "", url: "", description: "", logo: null, visible: true })}>
          <Icon name="plus" /> Добавить партнёра
        </button>
      </PageHead>
      <div className="a-card">
        {!items ? (
          <Loader />
        ) : items.length === 0 ? (
          <div className="a-empty">
            <strong>Партнёров пока нет</strong>Нажмите «Добавить партнёра».
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table" data-testid="partners-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Порядок</th>
                  <th style={{ width: 72 }}>Логотип</th>
                  <th>Название</th>
                  <th className="a-hide-sm">Сайт</th>
                  <th>На сайте</th>
                  <th style={{ textAlign: "right" }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <div className="a-row-tools">
                        <MoveButtons index={i} length={items.length} onMove={(d) => reorder(i, d)} label={p.name} />
                      </div>
                    </td>
                    <td>
                      <Thumb src={p.logo?.url} />
                    </td>
                    <td className="a-title-cell">
                      <a
                        href="#edit"
                        onClick={(e) => {
                          e.preventDefault();
                          setEdit({ id: p.id, name: p.name, url: p.url, description: p.description, logo: p.logo, visible: p.visible });
                        }}
                      >
                        {p.name}
                      </a>
                      {p.description && <span className="a-sub">{p.description.slice(0, 90)}</span>}
                    </td>
                    <td className="a-hide-sm" style={{ maxWidth: 220, overflowWrap: "anywhere" }}>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer">
                          {p.url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <StatusBadge status={p.visible ? "visible" : "hidden"} />
                    </td>
                    <td>
                      <div className="a-row-actions">
                        <button type="button" className="a-icon-btn" onClick={() => toggle(p)} aria-label={p.visible ? `Скрыть «${p.name}»` : `Показать «${p.name}»`} title={p.visible ? "Скрыть" : "Показать"}>
                          <Icon name={p.visible ? "eyeOff" : "eye"} size={15} />
                        </button>
                        <button
                          type="button"
                          className="a-icon-btn"
                          onClick={() => setEdit({ id: p.id, name: p.name, url: p.url, description: p.description, logo: p.logo, visible: p.visible })}
                          aria-label={`Редактировать «${p.name}»`}
                          title="Редактировать"
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button type="button" className="a-icon-btn danger" onClick={() => remove(p)} aria-label={`Удалить «${p.name}»`} title="Удалить">
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {edit && (
        <PartnerModal
          initial={edit}
          onClose={() => setEdit(null)}
          onSaved={(p) => {
            replace(p);
            setEdit(null);
          }}
        />
      )}
    </>
  );
}

function PartnerModal({ initial, onClose, onSaved }: { initial: Form; onClose: () => void; onSaved: (p: PartnerDto) => void }) {
  const toast = useToast();
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));

  const submit = async () => {
    setSaving(true);
    const body = { name: f.name, url: f.url, description: f.description, logoId: f.logo?.id ?? null, visible: f.visible };
    try {
      const p = f.id ? await api.put<PartnerDto>(`/partners/${f.id}`, body) : await api.post<PartnerDto>("/partners", body);
      toast.success(f.id ? "Партнёр сохранён" : "Партнёр добавлен");
      onSaved(p);
    } catch (e) {
      setErrors(fieldErrors(e));
      toast.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={f.id ? "Редактирование партнёра" : "Новый партнёр"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="a-btn" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" form="partner-form" className="a-btn a-btn-primary" disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </>
      }
    >
      <form
        id="partner-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextInput label="Название" value={f.name} onChange={(v) => set({ name: v })} required max={200} error={errors.name} name="name" />
        <TextInput label="Сайт партнёра" value={f.url} onChange={(v) => set({ url: v })} error={errors.url} placeholder="https://example.ru" name="url" />
        <TextInput label="Краткое описание" value={f.description} onChange={(v) => set({ description: v })} multiline max={1000} error={errors.description} hint="Показывается как подсказка при наведении на логотип." />
        <ImageField label="Логотип" value={f.logo} onChange={(m) => set({ logo: m })} hint="Без логотипа на сайте показывается название." />
        <label className="a-toggle">
          <input type="checkbox" checked={f.visible} onChange={(e) => set({ visible: e.target.checked })} />
          Показывать на сайте
        </label>
      </form>
    </Modal>
  );
}
