const MAX_LENGTH = 15_000;

const INSTRUCTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(the\s+)?(previous|above|prior)\s+instructions?/gi,
  /disregard\s+(the\s+)?(above|previous|prior)/gi,
  // Anchored to the start of a line: a fake role marker like a prompt
  // injection attempt reads "system:" as its own line, whereas legitimate
  // resume phrasing ("Operating System: Linux", "Built a system: ...")
  // always has other words before it on the same line.
  /^[ \t]*system\s*:/gim,
  /you\s+are\s+now/gi,
  /^[ \t]*new\s+instructions?\s*:/gim,
  /forget\s+(all\s+)?(the\s+)?(previous|above|prior)\s+instructions?/gi,
  /act\s+as\s+(if\s+you\s+are\s+)?/gi,
  /do\s+not\s+follow\s+the\s+(rules|instructions)\s+above/gi,
];

export function neutralizeInstructions(text: string): string {
  let sanitized = text;
  for (const pattern of INSTRUCTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[removed: instruction-like content]");
  }
  return sanitized;
}

export function truncate(text: string, maxLength = MAX_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}\n[truncated: content exceeded ${maxLength} characters]`;
}

export function sanitize(text: string, maxLength = MAX_LENGTH): string {
  return truncate(neutralizeInstructions(text), maxLength);
}
