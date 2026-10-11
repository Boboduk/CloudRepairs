import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-aqua-500/30 blur-3xl" />
        <Link href="/" className="relative">
          <Logo light />
        </Link>
        <div className="relative mt-auto">
          <div className="font-display text-[40px] font-semibold leading-tight">
            Чистая вода —
            <br />
            <span className="text-aqua-300">по вашей цене</span>
          </div>
          <p className="mt-4 max-w-md text-ink-300">Клиенты предлагают цену, водители-водовозы откликаются. Прозрачно, быстро, без диспетчеров.</p>
        </div>
      </div>
      <div className="flex min-h-dvh flex-col px-5 py-6 lg:items-center lg:justify-center">
        <Link href="/" className="mb-8 lg:hidden">
          <Logo />
        </Link>
        <div className="w-full max-w-md">
          <h1 className="text-[30px] font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
