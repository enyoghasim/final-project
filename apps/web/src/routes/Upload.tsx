import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, TriangleAlert } from "lucide-react";
import type { EvaluationRecord } from "@resume-ai/shared";
import { FileDropzone } from "../components/FileDropzone";
import { apiRequest, ApiError } from "../lib/apiClient";

const JOB_DESCRIPTION_MAX_LENGTH = 15_000;

const TIPS = [
  "Use a text-based PDF or DOCX — scanned images can't be read.",
  "Paste the full job description for the most accurate score.",
  "One evaluation per resume + job description pair, so it's easy to compare later.",
];

export function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("A resume file is required.");
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);
      return apiRequest<EvaluationRecord>("/api/evaluate", {
        method: "POST",
        body: formData,
        isFormData: true,
      });
    },
    onSuccess: (record) => navigate(`/results/${record._id}`),
  });

  const canSubmit = Boolean(file) && jobDescription.trim().length > 0 && !mutation.isPending;

  function handleFileSelected(selected: File) {
    setClientError(null);
    setFile(selected);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    mutation.mutate();
  }

  const errorMessage =
    clientError ??
    (mutation.isError
      ? mutation.error instanceof ApiError
        ? mutation.error.message
        : "Something went wrong. Please try again."
      : null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Evaluate your resume
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Upload your resume and paste the job description you're targeting.
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_260px]">
        <div className="card-brut space-y-6 p-5 sm:p-8">
          <FileDropzone
            file={file}
            onFileSelected={handleFileSelected}
            onError={setClientError}
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="jobDescription" className="text-sm font-medium text-slate-700">
                Job description
              </label>
              <span
                className={[
                  "text-xs tabular-nums",
                  jobDescription.length >= JOB_DESCRIPTION_MAX_LENGTH
                    ? "font-medium text-amber-600"
                    : "text-slate-400",
                ].join(" ")}
              >
                {jobDescription.length.toLocaleString()} /{" "}
                {JOB_DESCRIPTION_MAX_LENGTH.toLocaleString()}
              </span>
            </div>
            <textarea
              id="jobDescription"
              rows={10}
              maxLength={JOB_DESCRIPTION_MAX_LENGTH}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here…"
              className="w-full rounded-lg border-2 border-black bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border-2 border-red-700 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {mutation.isPending && (
            <div className="flex items-center gap-2.5 rounded-lg border-2 border-black bg-accent-50 px-3.5 py-2.5 text-sm font-medium text-slate-900">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Analyzing your resume against the job description…
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-brut w-full bg-accent px-4 py-2.5 text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {mutation.isPending ? "Evaluating…" : "Evaluate"}
          </button>
        </div>

        <aside className="card-brut h-fit p-5">
          <h2 className="text-sm font-bold text-slate-900">Tips for the best result</h2>
          <ul className="mt-3 space-y-3">
            {TIPS.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-black bg-accent" />
                {tip}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
