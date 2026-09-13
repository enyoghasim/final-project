import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import {
  EmptyResumeTextError,
  ResumeParsingError,
  UnsupportedFileTypeError,
} from "../utils/errors.js";

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export async function extractResumeText(file: UploadedFile): Promise<string> {
  let text: string;

  if (file.mimetype === PDF_MIME) {
    try {
      text = (await pdfParse(file.buffer)).text;
    } catch (error) {
      throw new ResumeParsingError(error);
    }
  } else if (file.mimetype === DOCX_MIME) {
    try {
      text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
    } catch (error) {
      throw new ResumeParsingError(error);
    }
  } else {
    throw new UnsupportedFileTypeError(file.mimetype);
  }

  if (!text.trim()) {
    throw new EmptyResumeTextError();
  }

  return text;
}
