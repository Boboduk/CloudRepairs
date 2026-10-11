/** Клиент API админки: cookie-сессия + CSRF-токен в заголовке каждого изменяющего запроса */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

let csrfToken = "";
let onUnauthorized: (() => void) | null = null;

export function setCsrfToken(t: string) {
  csrfToken = t;
}
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function request<T>(method: string, url: string, body?: unknown, isForm = false): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") headers["X-CSRF-Token"] = csrfToken;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`/api/admin${url}`, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Нет связи с сервером. Проверьте подключение к интернету.");
  }
  if (res.status === 204) return undefined as T;
  let data: { error?: string; details?: unknown } | null = null;
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok) {
    if (res.status === 401 && !url.startsWith("/auth/login")) onUnauthorized?.();
    throw new ApiError(res.status, data?.error || `Ошибка ${res.status}`, data?.details);
  }
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  put: <T>(url: string, body: unknown) => request<T>("PUT", url, body),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  del: (url: string) => request<void>("DELETE", url),
  upload: <T>(url: string, file: File, fields: Record<string, string> = {}, method: "POST" | "PUT" = "POST") => {
    const fd = new FormData();
    fd.append("file", file);
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    return request<T>(method, url, fd, true);
  },
};

/** Текст ошибки для уведомления, включая подробности валидации */
export function errorText(e: unknown): string {
  if (e instanceof ApiError) {
    const details = Array.isArray(e.details)
      ? (e.details as { message?: string; title?: string; type?: string }[])
          .map((d) => d.message ?? (d.type ? `${d.type}: ${d.title}` : ""))
          .filter(Boolean)
          .slice(0, 5)
      : [];
    return details.length ? `${e.message}: ${details.join("; ")}` : e.message;
  }
  return e instanceof Error ? e.message : "Неизвестная ошибка";
}

// ---------- типы ответов ----------
export interface MediaItem {
  id: number;
  url: string;
  filename: string;
  originalName: string;
  width: number | null;
  height: number | null;
  size: number;
  alt: string;
  createdAt: string;
  updatedAt: string;
}
export interface MediaRef {
  id: number;
  url: string;
  alt: string;
}
export type Status = "draft" | "published";

export interface NewsDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  coverId: number | null;
  cover: MediaRef | null;
  publishedAt: string | null;
  status: Status;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}
export interface PartnerDto {
  id: number;
  name: string;
  url: string;
  description: string;
  logoId: number | null;
  logo: MediaRef | null;
  visible: boolean;
  sortOrder: number;
}
export interface CaseDto {
  id: number;
  title: string;
  slug: string;
  client: string;
  partnerId: number | null;
  excerpt: string;
  body?: string;
  coverId: number | null;
  cover: MediaRef | null;
  imageIds: number[];
  images: MediaRef[];
  links: { label: string; href: string }[];
  status: Status;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
}
export interface ProductDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  imageId: number | null;
  image: MediaRef | null;
  linkUrl: string;
  linkLabel: string;
  status: Status;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
}
