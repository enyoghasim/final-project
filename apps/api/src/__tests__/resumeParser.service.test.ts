import { describe, expect, it, vi, beforeEach } from "vitest";

const pdfParseMock = vi.fn();
const mammothExtractMock = vi.fn();

vi.mock("pdf-parse", () => ({
  default: (...args: unknown[]) => pdfParseMock(...args),
}));

vi.mock("mammoth", () => ({
  default: { extractRawText: (...args: unknown[]) => mammothExtractMock(...args) },
}));

const { extractResumeText } = await import("../services/resumeParser.service.js");
const { UnsupportedFileTypeError, ResumeParsingError, EmptyResumeTextError } = await import(
  "../utils/errors.js"
);

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("extractResumeText", () => {
  beforeEach(() => {
    pdfParseMock.mockReset();
    mammothExtractMock.mockReset();
  });

  it("parses a PDF fixture into non-empty text", async () => {
    pdfParseMock.mockResolvedValue({ text: "Experienced software engineer with 5 years..." });
    const text = await extractResumeText({
      buffer: Buffer.from("fake pdf bytes"),
      mimetype: PDF_MIME,
      originalname: "resume.pdf",
    });
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("software engineer");
  });

  it("parses a DOCX fixture into non-empty text", async () => {
    mammothExtractMock.mockResolvedValue({ value: "Experienced software engineer, DOCX edition." });
    const text = await extractResumeText({
      buffer: Buffer.from("fake docx bytes"),
      mimetype: DOCX_MIME,
      originalname: "resume.docx",
    });
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("DOCX edition");
  });

  it("throws UnsupportedFileTypeError for an unsupported mimetype", async () => {
    await expect(
      extractResumeText({
        buffer: Buffer.from("plain text"),
        mimetype: "text/plain",
        originalname: "resume.txt",
      })
    ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
  });

  it("throws ResumeParsingError (not a raw library error) for a corrupted PDF", async () => {
    pdfParseMock.mockRejectedValue(new Error("Invalid PDF structure"));
    await expect(
      extractResumeText({
        buffer: Buffer.from("garbage bytes"),
        mimetype: PDF_MIME,
        originalname: "resume.pdf",
      })
    ).rejects.toBeInstanceOf(ResumeParsingError);
  });

  it("throws ResumeParsingError (not a raw library error) for a corrupted DOCX", async () => {
    mammothExtractMock.mockRejectedValue(new Error("not a valid zip file"));
    await expect(
      extractResumeText({
        buffer: Buffer.from("garbage bytes"),
        mimetype: DOCX_MIME,
        originalname: "resume.docx",
      })
    ).rejects.toBeInstanceOf(ResumeParsingError);
  });

  it("throws EmptyResumeTextError when the PDF has no extractable text", async () => {
    pdfParseMock.mockResolvedValue({ text: "   \n  " });
    await expect(
      extractResumeText({
        buffer: Buffer.from("scanned image pdf"),
        mimetype: PDF_MIME,
        originalname: "resume.pdf",
      })
    ).rejects.toBeInstanceOf(EmptyResumeTextError);
  });
});
