import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Lightbulb, Loader2, TriangleAlert } from "lucide-react";
import type { EvaluationRecord } from "@resume-ai/shared";
import { apiRequest, ApiError } from "../lib/apiClient";
import { ScoreGauge } from "../components/ScoreGauge";
import { SkillList } from "../components/SkillList";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Results() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => apiRequest<EvaluationRecord>(`/api/history/${id}`),
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        Loading results…
      </div>
    );
  }

  if (query.isError || !query.data) {
    const message =
      query.error instanceof ApiError ? query.error.message : "Could not load this evaluation.";
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <p role="alert" className="text-sm text-red-700">
          {message}
        </p>
        <Link
          to="/upload"
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          Run another evaluation
        </Link>
      </div>
    );
  }

  const record = query.data;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Evaluation results
          </h1>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            {record.resumeFileName}
            <span className="text-slate-300">·</span>
            {formatDate(record.createdAt)}
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up space-y-6">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
          <ScoreGauge score={record.matchScore} />
        </div>

        <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:grid-cols-2 sm:p-8">
          <SkillList title="Matched Skills" skills={record.matchedSkills} variant="matched" />
          <SkillList title="Missing Skills" skills={record.missingSkills} variant="missing" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-50 text-accent-600">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            Recommendations
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {record.recommendations}
          </p>
        </div>

        <Link
          to="/upload"
          className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-accent-hover hover:shadow-card"
        >
          Run another evaluation
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
