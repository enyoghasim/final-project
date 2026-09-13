import { useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface FileDropzoneProps {
  file: File | null;
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const lowerName = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function FileDropzone({ file, onFileSelected, onError }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSelect(candidate: File) {
    if (!isAcceptedFile(candidate)) {
      onError("Only PDF and DOCX files are supported.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      onError("File is too large. Maximum size is 5 MB.");
      return;
    }
    onFileSelected(candidate);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) validateAndSelect(dropped);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) validateAndSelect(selected);
  }

  function handleReplaceClick(event: MouseEvent) {
    event.stopPropagation();
    inputRef.current?.click();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="file-dropzone"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={[
        "group cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8",
        isDragging
          ? "border-black bg-accent-100 shadow-inner"
          : file
            ? "border-black bg-accent-50"
            : "border-slate-400 bg-white hover:border-black hover:bg-accent-50/50",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        aria-label="Resume file"
        onChange={handleInputChange}
      />
      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-accent-100 text-black">
            <FileText className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="break-all text-sm font-medium text-slate-900">{file.name}</p>
            <p className="mt-0.5 text-xs text-slate-400">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleReplaceClick}
            className="flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <X className="h-3 w-3" />
            Choose a different file
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-slate-100 text-slate-500 transition-colors group-hover:bg-accent-100 group-hover:text-black">
            <UploadCloud className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">
              <span className="hidden sm:inline">Drag and drop your resume, or </span>
              <span className="font-bold text-accent-700 underline decoration-2 underline-offset-2">
                click to browse
              </span>
            </p>
            <p className="text-xs text-slate-400">PDF or DOCX, up to 5 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
