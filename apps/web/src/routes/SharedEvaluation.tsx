import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, FileText, Lightbulb, Loader2, TriangleAlert } from "lucide-react";
import type { PublicEvaluation } from "@resume-ai/shared";
import { apiRequest, ApiError, API_BASE_URL } from "../lib/apiClient";
import { ScoreGauge } from "../components/ScoreGauge";
import { SkillList } from "../components/SkillList";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function SharedEvaluation() {
  const { shareId } = useParams<{ shareId: string }>();

  const query = useQuery({
    queryKey: ["shared-evaluation", shareId],
    queryFn: () => apiRequest<PublicEvaluation>(`/api/public/evaluations/${shareId}`),
    enabled: Boolean(shareId),
    retry: false,
  });

  // Real browsers land on the SPA (crawlers get the API's prerendered meta
  // tags instead, see apps/web/nginx.conf.template) — this just keeps the
  // browser tab title in sync with what a crawler would see.
  useEffect(() => {
    const previousTitle = document.title;
    if (query.data) {
      document.title = `${query.data.jobTitle} — Resume Match Evaluation | Resume AI`;
    }
    return () => {
      document.title = previousTitle;
    };
  }, [query.data]);

  if (query.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        Loading evaluation…
      </div>
    );
  }

  if (query.isError || !query.data) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <p role="alert" className="text-sm font-medium text-red-700">
          {notFound
            ? "No evaluation found. This link may be invalid or is no longer shared."
            : "Could not load this evaluation."}
        </p>
        <Link to="/" className="text-sm font-medium text-accent hover:text-accent-hover">
          Go to Resume AI
        </Link>
      </div>
    );
  }

  const record = query.data;
  const resumeUrl = `${API_BASE_URL}/api/public/evaluations/${shareId}/resume`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div>
          <span className="mb-2 inline-block rounded-full border-2 border-black bg-accent-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
            Publicly shared evaluation
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {record.jobTitle}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-500">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="break-all">{record.resumeFileName}</span>
            <span className="text-slate-300">·</span>
            {formatDate(record.createdAt)}
            <span className="text-slate-300">·</span>
            <Eye className="h-3.5 w-3.5 shrink-0" />
            {record.viewCount} view{record.viewCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up space-y-6">
        <div className="card-brut flex flex-col items-center gap-6 p-6 sm:p-8">
          <ScoreGauge score={record.matchScore} />
        </div>

        <div className="card-brut grid gap-6 p-5 sm:grid-cols-2 sm:p-8">
          <SkillList title="Matched Skills" skills={record.matchedSkills} variant="matched" />
          <SkillList title="Missing Skills" skills={record.missingSkills} variant="missing" />
        </div>

        <div className="card-brut p-5 sm:p-8">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-accent-100 text-black">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            Recommendations
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {record.recommendations}
          </p>
        </div>

        <div className="card-brut p-5 sm:p-8">
          <h2 className="text-sm font-bold text-slate-900">Job description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {record.jobDescription}
          </p>
        </div>

        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-brut group w-full bg-accent px-5 py-2.5 text-black sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Download resume
        </a>
      </div>
    </div>
  );
}
