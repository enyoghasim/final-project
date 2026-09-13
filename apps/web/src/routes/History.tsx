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
  low: "bg-red-50 text-red-700 border-2 border-black",
  medium: "bg-amber-50 text-amber-700 border-2 border-black",
  high: "bg-emerald-50 text-emerald-700 border-2 border-black",
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">History</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Every resume evaluation you've run, most recent first.
        </p>
      </div>

      {query.isLoading && (
        <div className="card-brut flex items-center gap-2 px-6 py-16 text-sm text-slate-500">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-black" />
        </div>
      )}

      {query.isError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border-2 border-black bg-red-50 px-6 py-5 text-sm font-medium text-red-700"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {query.error instanceof ApiError ? query.error.message : "Could not load history."}
        </div>
      )}

      {query.data && query.data.items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-black bg-white px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-slate-100 text-slate-500">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">No evaluations yet.</p>
          <Link to="/upload" className="text-sm font-bold text-accent-700 hover:text-black">
            Run your first evaluation
          </Link>
        </div>
      )}

      {query.data && query.data.items.length > 0 && (
        <>
          {/* Mobile: stacked cards */}
          <div className="animate-fade-in-up flex flex-col gap-3 sm:hidden">
            {query.data.items.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/results/${item._id}`)}
                className="card-brut cursor-pointer p-4 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {truncate(item.jobDescription, TRUNCATE_LENGTH)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{item.resumeFileName}</p>
                  </div>
                  <ScoreBadge score={item.matchScore} />
                </div>
                <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="card-brut animate-fade-in-up hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-black bg-accent-50 text-xs font-bold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Job description</th>
                  <th className="px-5 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {query.data.items.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => navigate(`/results/${item._id}`)}
                    className="group cursor-pointer transition-colors hover:bg-accent-50/60"
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
              className="flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1.5 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <span className="text-xs font-medium text-slate-500">
              Page {query.data.page} of {query.data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= query.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1.5 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
