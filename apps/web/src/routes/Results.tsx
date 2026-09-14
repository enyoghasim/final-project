import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  FileText,
  Lightbulb,
  Link2,
  Link2Off,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import type { EvaluationRecord, ShareStatus } from "@resume-ai/shared";
import { apiRequest, ApiError } from "../lib/apiClient";
import { ScoreGauge } from "../components/ScoreGauge";
import { SkillList } from "../components/SkillList";

function ShareControl({ record }: { record: EvaluationRecord }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const applyShareStatus = (status: ShareStatus) => {
    queryClient.setQueryData<EvaluationRecord>(["evaluation", record._id], (prev) =>
      prev ? { ...prev, isShared: status.isShared, shareId: status.shareId || prev.shareId } : prev
    );
  };

  const shareMutation = useMutation({
    mutationFn: () => apiRequest<ShareStatus>(`/api/history/${record._id}/share`, { method: "POST" }),
    onSuccess: applyShareStatus,
  });

  const unshareMutation = useMutation({
    mutationFn: () => apiRequest<ShareStatus>(`/api/history/${record._id}/share`, { method: "DELETE" }),
    onSuccess: applyShareStatus,
  });

  const shareUrl = record.shareId ? `${window.location.origin}/evaluation/${record.shareId}` : null;
  const pending = shareMutation.isPending || unshareMutation.isPending;

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — the link is still
      // shown below for the user to copy manually.
    }
  }

  return (
    <div className="card-brut p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-accent-100 text-black">
            <Link2 className="h-3.5 w-3.5" />
          </span>
          Share this result
        </h2>
        {record.isShared && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Eye className="h-3.5 w-3.5" />
            {record.viewCount} view{record.viewCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {record.isShared && shareUrl ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-500">
            Anyone with this link can view this evaluation and download the resume — no account
            needed.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-full border-2 border-black bg-white px-4 py-2 text-sm text-slate-700"
            />
            <button
              type="button"
              onClick={copyLink}
              className="btn-brut justify-center bg-accent px-4 py-2 text-black"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => unshareMutation.mutate()}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Link2Off className="h-3.5 w-3.5" />
            Stop sharing
          </button>
          {unshareMutation.isError && (
            <p role="alert" className="text-sm text-red-700">
              Could not stop sharing this result. Please try again.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-500">
            Generate a public link so anyone can view this evaluation and the original resume —
            handy for sharing with a hiring manager or mentor.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => shareMutation.mutate()}
            className="btn-brut bg-accent px-5 py-2.5 text-black disabled:opacity-50"
          >
            {shareMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
            Create share link
          </button>
          {shareMutation.isError && (
            <p role="alert" className="text-sm text-red-700">
              Could not create a share link. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {record.jobTitle}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-500">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="break-all">{record.resumeFileName}</span>
            <span className="text-slate-300">·</span>
            {formatDate(record.createdAt)}
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

        <ShareControl record={record} />

        <Link to="/upload" className="btn-brut group w-full bg-accent px-5 py-2.5 text-black sm:w-auto">
          Run another evaluation
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
