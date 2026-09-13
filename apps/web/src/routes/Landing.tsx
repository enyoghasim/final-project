import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileUp,
  ScanSearch,
  Target,
  ListChecks,
  Sparkles,
  Gauge,
} from "lucide-react";
import { useAuth } from "../lib/authContext";

const FEATURES = [
  {
    icon: Gauge,
    title: "Instant match score",
    description:
      "See a 0–100 score for how well your resume lines up with a specific job description, in seconds.",
  },
  {
    icon: ListChecks,
    title: "Skill gap detection",
    description:
      "Know exactly which skills from the job description show up in your resume — and which ones don't.",
  },
  {
    icon: Sparkles,
    title: "Actionable recommendations",
    description:
      "Get specific, plain-English suggestions for closing the gap before you hit submit.",
  },
];

const STEPS = [
  {
    icon: FileUp,
    title: "Upload your resume",
    description: "Drop in a PDF or DOCX — nothing leaves your account.",
  },
  {
    icon: ScanSearch,
    title: "Paste the job description",
    description: "GPT compares the two against the actual requirements.",
  },
  {
    icon: Target,
    title: "See where you stand",
    description: "Get your score, skill gaps, and what to fix — before you apply.",
  },
];

export function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/upload" : "/signup";

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative border-b-2 border-black bg-accent-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] overflow-hidden sm:h-[520px]"
        >
          <div className="absolute left-1/2 top-[-160px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent-200 opacity-60 blur-3xl sm:h-[520px] sm:w-[900px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:gap-16 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-2 lg:pb-28 lg:pt-24">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-brut-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by GPT
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Know how you match,
              <br className="hidden sm:block" /> before you apply.
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-700 sm:text-lg">
              Upload your resume and a job description to get an instant match
              score, matched and missing skills, and concrete recommendations —
              in under a minute.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={primaryHref}
                className="btn-brut group w-full bg-accent px-6 py-3 text-base text-black sm:w-auto"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-700 underline decoration-2 underline-offset-4 hover:text-slate-900"
                >
                  Already have an account? Log in
                </Link>
              )}
            </div>

            <p className="mt-6 text-xs font-medium text-slate-500">
              No credit card required. Your first evaluation takes about a minute.
            </p>
          </div>

          <div className="relative animate-fade-in lg:justify-self-end">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b-2 border-black bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Everything you need before you hit submit
            </h2>
            <p className="mt-3 text-slate-600">
              One upload gives you a full picture of how your resume reads
              against the role.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="card-brut p-6 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-accent-100 text-black">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b-2 border-black bg-[#fffaf3] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            How it works
          </h2>

          <div className="relative mt-12 grid gap-10 sm:mt-14 sm:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-6 hidden h-0.5 bg-black sm:block"
            />
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-brut-sm">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <span className="mt-3 text-xs font-extrabold uppercase tracking-wide text-accent-700">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Ready to see your match score?
          </h2>
          <Link
            to={primaryHref}
            className="btn-brut w-full bg-accent px-6 py-3 text-base text-black sm:w-auto"
          >
            {isAuthenticated ? "Evaluate a resume" : "Get started free"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function HeroPreviewCard() {
  return (
    <div className="card-brut w-full max-w-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Match score
          </p>
          <p className="text-sm font-semibold text-slate-900">senior-frontend.pdf</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-emerald-400">
          <span className="text-lg font-extrabold text-black">86</span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {["React", "TypeScript", "REST APIs"].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-emerald-800/20 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
            >
              {skill}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["GraphQL", "AWS"].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-amber-800/20 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border-2 border-black bg-accent-50 p-3">
        <p className="text-xs leading-relaxed text-slate-700">
          Strong match on core frontend skills. Highlight any GraphQL or cloud
          platform exposure to close the remaining gap.
        </p>
      </div>
    </div>
  );
}
