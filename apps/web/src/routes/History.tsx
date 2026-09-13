import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Inbox, Loader2, TriangleAlert } from "lucide-react";
import type { PaginatedEvaluations } from "@resume-ai/shared";
import { apiRequest, ApiError } from "../lib/apiClient";
import { getScoreBand } from "../components/ScoreGauge";

const PAGE_SIZE = 10;
const TRUNCATE_LENGTH = 90;

const SCORE_BADGE_STYLES: Record<ReturnType<typeof getScoreBand>, string> = {
  low: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  high: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex min-w-[2.75rem] justify-center rounded-full px-2.5 py-1 text-sm font-semibold ${SCORE_BADGE_STYLES[getScoreBand(score)]}`}
    >
      {score}
    </span>
  );
}

export function History() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["history", page],
    queryFn: () =>
      apiRequest<PaginatedEvaluations>("/api/history", {
        query: { page, limit: PAGE_SIZE },
      }),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">History</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Every resume evaluation you've run, most recent first.
        </p>
      </div>

      {query.isLoading && (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-sm text-slate-500 shadow-soft">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent" />
        </div>
      )}

      {query.isError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-5 text-sm text-red-700"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {query.error instanceof ApiError ? query.error.message : "Could not load history."}
        </div>
      )}

      {query.data && query.data.items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">No evaluations yet.</p>
          <Link to="/upload" className="text-sm font-medium text-accent hover:text-accent-hover">
            Run your first evaluation
          </Link>
        </div>
      )}

      {query.data && query.data.items.length > 0 && (
        <>
          <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Job description</th>
                  <th className="px-5 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data.items.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => navigate(`/results/${item._id}`)}
                    className="group cursor-pointer transition-colors hover:bg-accent-50/40"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div>
                        <p className="font-medium text-slate-900">
                          {truncate(item.jobDescription, TRUNCATE_LENGTH)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{item.resumeFileName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ScoreBadge score={item.matchScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-xs text-slate-400">
              Page {query.data.page} of {query.data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= query.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
