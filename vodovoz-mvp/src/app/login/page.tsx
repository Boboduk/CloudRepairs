"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Shield, Truck, User } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Field, cn } from "@/components/ui";
import { login } from "@/lib/auth";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/data/catalog";
import type { Role } from "@/types";

const HOME: Record<Role, string> = { client: "/client", driver: "/driver", admin: "/admin" };
const ICON = { client: User, driver: Truck, admin: Shield };

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const wanted = (params.get("role") as Role | null) ?? "client";
  const demo = DEMO_ACCOUNTS.find((a) => a.role === wanted) ?? DEMO_ACCOUNTS[0];
  const [email, setEmail] = useState(demo.email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");

  const submit = (e?: React.FormEvent, mail = email, pass = password) => {
    e?.preventDefault();
    const res = login(mail, pass);
    if (!res.ok) return setError(res.error);
    router.push(HOME[res.user.role]);
  };

  return (
    <AuthLayout title="Вход" subtitle="Используйте демо-аккаунт или свой, созданный при регистрации">
      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((a) => {
          const Icon = ICON[a.role];
          return (
            <button
              key={a.role}
              type="button"
              onClick={() => {
                setEmail(a.email);
                setPassword(DEMO_PASSWORD);
                submit(undefined, a.email, DEMO_PASSWORD);
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border bg-white px-2 py-3 text-[13px] font-bold transition hover:border-aqua-400",
                a.role === wanted ? "border-aqua-500 ring-2 ring-aqua-500/20" : "border-ink-200",
              )}
            >
              <Icon className="h-5 w-5 text-aqua-500" />
              {a.title}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[12px] text-ink-400">Нажмите на роль — вход выполнится сразу</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <Field label="E-mail">
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </Field>
        <Field label="Пароль">
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        {error && <div className="rounded-xl bg-coral-50 px-3 py-2 text-sm font-semibold text-coral-600">{error}</div>}
        <Button type="submit" size="xl" full icon={<LogIn className="h-5 w-5" />}>
          Войти
        </Button>
      </form>
      <div className="mt-6 rounded-2xl bg-white p-4 text-[13px] text-ink-500 ring-1 ring-ink-100">
        <div className="mb-1 font-bold text-ink-700">Тестовые аккаунты (пароль {DEMO_PASSWORD})</div>
        {DEMO_ACCOUNTS.map((a) => (
          <div key={a.role} className="font-mono">
            {a.title}: {a.email}
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-[15px] text-ink-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-bold text-aqua-600">
          Зарегистрироваться
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
