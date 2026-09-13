import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#fffaf3] px-4 py-12 sm:px-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-accent text-black">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="card-brut p-6">{children}</div>

        <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </div>
  );
}

export function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border-2 border-black bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400";

export const submitButtonClass =
  "btn-brut w-full bg-accent px-4 py-2.5 text-black disabled:cursor-not-allowed disabled:opacity-60";
