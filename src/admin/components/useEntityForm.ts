import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { fieldErrors, useToast, useUnsavedWarning } from "../ui";

/**
 * Загрузка и сохранение записи (новость, кейс, продукт) через REST API:
 * GET /:id, POST / (создание), PUT /:id (сохранение).
 */
export function useEntityForm<Form, Dto>({
  endpoint,
  listPath,
  id,
  empty,
  fromDto,
  toPayload,
  savedText,
}: {
  endpoint: string;
  listPath: string;
  id: string | undefined;
  empty: Form;
  fromDto: (d: Dto) => Form;
  toPayload: (f: Form) => unknown;
  savedText: string;
}) {
  const isNew = !id || id === "new";
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(empty);
  const [dto, setDto] = useState<Dto | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const emptyRef = useRef(empty);
  useUnsavedWarning(dirty);

  useEffect(() => {
    if (isNew) {
      setForm(emptyRef.current);
      setDto(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<Dto>(`${endpoint}/${id}`)
      .then((d) => {
        setDto(d);
        setForm(fromDto(d));
        setDirty(false);
      })
      .catch((e) => {
        if ((e as { status?: number }).status === 404) setNotFound(true);
        else toast.error(e);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, id, isNew]);

  const set = useCallback((patch: Partial<Form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
    setErrors((e) => {
      const keys = Object.keys(patch);
      if (!keys.some((k) => k in e)) return e;
      const copy = { ...e };
      keys.forEach((k) => delete copy[k]);
      return copy;
    });
  }, []);

  const save = useCallback(
    async (override?: Partial<Form>) => {
      const data = { ...form, ...override };
      setSaving(true);
      try {
        const d = isNew ? await api.post<Dto>(endpoint, toPayload(data)) : await api.put<Dto>(`${endpoint}/${id}`, toPayload(data));
        setDto(d);
        setForm(fromDto(d));
        setErrors({});
        setDirty(false);
        toast.success(savedText);
        if (isNew) navigate(`${listPath}/${(d as { id: number }).id}`, { replace: true });
        return d;
      } catch (e) {
        setErrors(fieldErrors(e));
        toast.error(e);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [form, isNew, endpoint, id, toPayload, fromDto, toast, savedText, navigate, listPath],
  );

  return { form, set, save, dto, loading, notFound, saving, errors, dirty, isNew };
}
