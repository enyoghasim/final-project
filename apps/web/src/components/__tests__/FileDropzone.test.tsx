import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileDropzone } from "../FileDropzone";

function makeFile(name: string, type: string, sizeBytes = 1024) {
  const file = new File([new Uint8Array(sizeBytes)], name, { type });
  return file;
}

describe("FileDropzone", () => {
  it("accepts a PDF file", async () => {
    const onFileSelected = vi.fn();
    const onError = vi.fn();
    render(<FileDropzone file={null} onFileSelected={onFileSelected} onError={onError} />);

    const input = screen.getByLabelText(/resume file/i) as HTMLInputElement;
    const file = makeFile("resume.pdf", "application/pdf");
    await userEvent.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledWith(file);
    expect(onError).not.toHaveBeenCalled();
  });

  it("rejects a file that is not PDF or DOCX", async () => {
    const onFileSelected = vi.fn();
    const onError = vi.fn();
    render(<FileDropzone file={null} onFileSelected={onFileSelected} onError={onError} />);

    const input = screen.getByLabelText(/resume file/i) as HTMLInputElement;
    const file = makeFile("resume.txt", "text/plain");
    // userEvent.upload silently no-ops for files that don't match the
    // input's `accept` attribute (mirroring real browser file pickers), so
    // this simulates a user (or OS) bypassing that filter directly.
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/pdf and docx/i));
  });

  it("rejects a file over the 5 MB size limit", async () => {
    const onFileSelected = vi.fn();
    const onError = vi.fn();
    render(<FileDropzone file={null} onFileSelected={onFileSelected} onError={onError} />);

    const input = screen.getByLabelText(/resume file/i) as HTMLInputElement;
    const file = makeFile("resume.pdf", "application/pdf", 6 * 1024 * 1024);
    await userEvent.upload(input, file);

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/too large/i));
  });
});
