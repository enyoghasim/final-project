export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor(mimetype: string) {
    super(
      `Unsupported file type "${mimetype}". Please upload a PDF or DOCX resume.`,
      400
    );
  }
}

export class ResumeParsingError extends AppError {
  constructor(details?: unknown) {
    super(
      "Could not read this file. Please make sure it's a valid, non-corrupted PDF or DOCX.",
      400
    );
    this.cause = details;
  }
}

export class EmptyResumeTextError extends AppError {
  constructor() {
    super(
      "Could not find any text in this resume. If it's a scanned image, please upload a text-based PDF or DOCX instead.",
      400
    );
  }
}

export class EvaluationParsingError extends AppError {
  constructor(details?: unknown) {
    super("Evaluation failed, please try again.", 502);
    this.cause = details;
  }
}

export class OpenAIRequestError extends AppError {
  constructor(message = "The AI service is temporarily unavailable, please try again.") {
    super(message, 502);
  }
}

export class StorageError extends AppError {
  constructor(message = "A storage error occurred. Please try again.", details?: unknown) {
    super(message, 502);
    this.cause = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}
