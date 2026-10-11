import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { Loader, PageHead, TextInput, fieldErrors, useToast, useUnsavedWarning } from "../ui";

interface Settings {
  email: string;
  phone: string;
  phoneNote: string;
  telegramMain: string;
  telegramPersonal: string;
  footerTitle: string;
  footerButton: string;
  copyright: string;
  headerCta: string;
}

export default function SettingsPage() {
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useUnsavedWarning(dirty);

  useEffect(() => {
    api.get<Settings>("/settings").then(setS).catch(toast.error);
  }, [toast]);

  if (!s) return <Loader />;
  const set = (patch: Partial<Settings>) => {
    setS({ ...s, ...patch });
    setDirty(true);
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      setS(await api.put<Settings>("/settings", s));
      setErrors({});
      setDirty(false);
      toast.success("Настройки сохранены");
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHead title="Настройки" sub="Контакты в шапке и подвале сайта, смена пароля администратора." />
      <div className="a-grid-2" style={{ alignItems: "start" }}>
        <form className="a-card a-card-pad" onSubmit={save} noValidate>
          <h2 className="a-card-title">Контакты и подвал</h2>
          <TextInput label="E-mail для заявок" value={s.email} onChange={(v) => set({ email: v })} type="email" required error={errors.email} hint="На этот адрес открывается письмо при нажатии кнопок «Оставить заявку»." />
          <TextInput label="Телефон" value={s.phone} onChange={(v) => set({ phone: v })} max={50} error={errors.phone} />
          <TextInput label="Подпись к телефону" value={s.phoneNote} onChange={(v) => set({ phoneNote: v })} max={200} error={errors.phoneNote} />
          <div className="a-grid-2">
            <TextInput label="Телеграм-канал" value={s.telegramMain} onChange={(v) => set({ telegramMain: v })} error={errors.telegramMain} hint="Имя без @" />
            <TextInput label="Телеграм для связи" value={s.telegramPersonal} onChange={(v) => set({ telegramPersonal: v })} error={errors.telegramPersonal} hint="Имя без @" />
          </div>
          <TextInput label="Кнопка в шапке" value={s.headerCta} onChange={(v) => set({ headerCta: v })} max={40} error={errors.headerCta} />
          <TextInput label="Заголовок в подвале" value={s.footerTitle} onChange={(v) => set({ footerTitle: v })} max={300} error={errors.footerTitle} />
          <TextInput label="Кнопка в подвале" value={s.footerButton} onChange={(v) => set({ footerButton: v })} max={60} error={errors.footerButton} />
          <TextInput label="Копирайт" value={s.copyright} onChange={(v) => set({ copyright: v })} max={100} error={errors.copyright} />
          <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить настройки"}
          </button>
        </form>
        <PasswordForm />
      </div>
    </>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== repeat) return setError("Новый пароль и повтор не совпадают");
    if (next.length < 10) return setError("Новый пароль должен быть не короче 10 символов");
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setRepeat("");
      toast.success("Пароль изменён. Другие сеансы входа завершены.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="a-card a-card-pad" onSubmit={submit} noValidate>
      <h2 className="a-card-title">Смена пароля</h2>
      <p className="a-card-help">Не короче 10 символов, должен содержать буквы и цифры. После смены все другие сеансы входа будут завершены.</p>
      {error && (
        <div className="a-alert error" role="alert">
          {error}
        </div>
      )}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <div className="a-field">
        <label className="a-label" htmlFor="pw-current">
          Текущий пароль
        </label>
        <input id="pw-current" type="password" className="a-input" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div className="a-field">
        <label className="a-label" htmlFor="pw-new">
          Новый пароль
        </label>
        <input id="pw-new" type="password" className="a-input" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
      </div>
      <div className="a-field">
        <label className="a-label" htmlFor="pw-repeat">
          Повторите новый пароль
        </label>
        <input id="pw-repeat" type="password" className="a-input" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} />
      </div>
      <button type="submit" className="a-btn a-btn-primary" disabled={busy || !current || !next}>
        {busy ? "Сохранение…" : "Изменить пароль"}
      </button>
    </form>
  );
}
