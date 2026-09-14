import PDFDocument from "pdfkit";

const PAGE_BG = "#fffaf3";
const BLACK = "#000000";
const INK = "#0f172a";
const MUTED = "#64748b";
const BODY_TEXT = "#475569";
const ACCENT = "#ff90e8";

const MARGIN = 50;
const CONTENT_WIDTH = 495;
const CARD_PADDING = 22;
const CARD_RADIUS = 14;
const SHADOW_OFFSET = 4;
const BORDER = 2;
const SECTION_GAP = 18;
// If a text card would need to grow taller than this, its box can't be
// guaranteed to fit on a single page — fall back to plain flowing text
// instead of a hard-edged card that PDF pages can't visually span.
const MAX_BOXED_CARD_HEIGHT = 620;

export interface EvaluationReportInput {
  jobTitle: string;
  resumeFileName: string;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string;
  createdAt: Date;
}

interface BandPalette {
  solid: string;
  chipBg: string;
  chipText: string;
  label: string;
}

function bandPalette(score: number): BandPalette {
  if (score < 50) return { solid: "#ef4444", chipBg: "#fef2f2", chipText: "#b91c1c", label: "Needs work" };
  if (score < 75) return { solid: "#d97706", chipBg: "#fffbeb", chipText: "#b45309", label: "Good match" };
  return { solid: "#059669", chipBg: "#ecfdf5", chipText: "#047857", label: "Great match" };
}

export function pdfFileName(jobTitle: string): string {
  const slug = jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "resume-evaluation"}.pdf`;
}

function paintPageBackground(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(PAGE_BG);
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, needed: number): number {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (y + needed > bottom) {
    doc.addPage();
    return doc.page.margins.top;
  }
  return y;
}

function drawCardShell(doc: PDFKit.PDFDocument, y: number, height: number, fill = "#ffffff") {
  doc
    .roundedRect(MARGIN + SHADOW_OFFSET, y + SHADOW_OFFSET, CONTENT_WIDTH, height, CARD_RADIUS)
    .fill(BLACK);
  doc
    .roundedRect(MARGIN, y, CONTENT_WIDTH, height, CARD_RADIUS)
    .lineWidth(BORDER)
    .fillAndStroke(fill, BLACK);
}

interface ChipLayout {
  text: string;
  x: number;
  y: number;
  width: number;
}

const CHIP_HEIGHT = 22;

function layoutChips(doc: PDFKit.PDFDocument, skills: string[], maxWidth: number): ChipLayout[] {
  doc.fontSize(9).font("Helvetica-Bold");
  let x = 0;
  let y = 0;
  const chips: ChipLayout[] = [];
  for (const skill of skills) {
    const chipWidth = doc.widthOfString(skill) + 20;
    if (x > 0 && x + chipWidth > maxWidth) {
      x = 0;
      y += CHIP_HEIGHT + 8;
    }
    chips.push({ text: skill, x, y, width: chipWidth });
    x += chipWidth + 6;
  }
  return chips;
}

function chipsHeight(chips: ChipLayout[]): number {
  if (chips.length === 0) return CHIP_HEIGHT;
  return Math.max(...chips.map((c) => c.y)) + CHIP_HEIGHT;
}

function drawChips(
  doc: PDFKit.PDFDocument,
  chips: ChipLayout[],
  originX: number,
  originY: number,
  bg: string,
  textColor: string
) {
  if (chips.length === 0) {
    doc.fontSize(10).font("Helvetica").fillColor(MUTED).text("None", originX, originY);
    return;
  }
  doc.fontSize(9).font("Helvetica-Bold");
  for (const chip of chips) {
    const cx = originX + chip.x;
    const cy = originY + chip.y;
    doc
      .roundedRect(cx, cy, chip.width, CHIP_HEIGHT, CHIP_HEIGHT / 2)
      .lineWidth(1.5)
      .fillAndStroke(bg, BLACK);
    doc.fillColor(textColor).text(chip.text, cx, cy + 6.5, { width: chip.width, align: "center" });
  }
}

function renderTextCard(doc: PDFKit.PDFDocument, y: number, title: string, body: string, bodyColor: string): number {
  const innerWidth = CONTENT_WIDTH - CARD_PADDING * 2;
  doc.fontSize(10).font("Helvetica");
  const bodyHeight = doc.heightOfString(body, { width: innerWidth });
  const cardHeight = CARD_PADDING * 2 + 18 + bodyHeight;

  if (cardHeight > MAX_BOXED_CARD_HEIGHT) {
    // Too tall to safely box on one page — render as plain flowing text,
    // which PDFKit will paginate normally on its own.
    doc.fontSize(12).font("Helvetica-Bold").fillColor(INK).text(title, MARGIN, y, { width: CONTENT_WIDTH });
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica").fillColor(bodyColor).text(body, { width: CONTENT_WIDTH });
    return doc.y + SECTION_GAP;
  }

  y = ensureSpace(doc, y, cardHeight);
  drawCardShell(doc, y, cardHeight);
  doc.fontSize(12).font("Helvetica-Bold").fillColor(INK).text(title, MARGIN + CARD_PADDING, y + CARD_PADDING);
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(bodyColor)
    .text(body, MARGIN + CARD_PADDING, y + CARD_PADDING + 18, { width: innerWidth });
  return y + cardHeight + SECTION_GAP;
}

export async function renderEvaluationPdf(input: EvaluationReportInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: MARGIN });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  // The constructor already creates page 1 before this listener can be
  // attached, so page 1's background is painted explicitly below.
  doc.on("pageAdded", () => paintPageBackground(doc));
  paintPageBackground(doc);

  let y = MARGIN;

  // Header — matches the navbar: pink square mark + wordmark, no card box.
  doc.roundedRect(MARGIN, y, 16, 16, 4).lineWidth(BORDER).fillAndStroke(ACCENT, BLACK);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(13).text("RESUME AI", MARGIN + 24, y + 2);
  y += 36;

  doc.fontSize(10).font("Helvetica").fillColor(MUTED).text("Resume match evaluation", MARGIN, y);
  y = doc.y + 4;

  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fillColor(INK)
    .text(input.jobTitle, MARGIN, y, { width: CONTENT_WIDTH });
  y = doc.y + 4;

  const dateStr = input.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(MUTED)
    .text(`${input.resumeFileName}  ·  ${dateStr}`, MARGIN, y);
  y = doc.y + SECTION_GAP;

  // Score card — bold solid circle badge + outlined pill label, mirroring
  // the site's ScoreGauge (ring + band chip) in the same brutalist language.
  const band = bandPalette(input.matchScore);
  const score = Math.round(Math.min(100, Math.max(0, input.matchScore)));
  const scoreCardHeight = 160;
  y = ensureSpace(doc, y, scoreCardHeight);
  drawCardShell(doc, y, scoreCardHeight);

  const cx = MARGIN + CONTENT_WIDTH / 2;
  const circleR = 42;
  const circleCy = y + 30 + circleR;
  doc.circle(cx, circleCy, circleR).lineWidth(3).fillAndStroke(band.solid, BLACK);
  doc.fontSize(28).font("Helvetica-Bold").fillColor("#ffffff");
  const scoreStr = `${score}`;
  doc.text(scoreStr, cx - doc.widthOfString(scoreStr) / 2, circleCy - 16);

  doc.fontSize(11).font("Helvetica-Bold");
  const labelWidth = doc.widthOfString(band.label) + 24;
  const pillY = circleCy + circleR + 18;
  doc
    .roundedRect(cx - labelWidth / 2, pillY, labelWidth, 24, 12)
    .lineWidth(BORDER)
    .fillAndStroke(band.chipBg, BLACK);
  doc
    .fillColor(band.chipText)
    .text(band.label, cx - labelWidth / 2, pillY + 7, { width: labelWidth, align: "center" });

  y = y + scoreCardHeight + SECTION_GAP;

  // Skills card — two columns of pill chips, like the site's side-by-side
  // Matched/Missing SkillList panels.
  const columnGap = 24;
  const colWidth = (CONTENT_WIDTH - CARD_PADDING * 2 - columnGap) / 2;
  const matchedChips = layoutChips(doc, input.matchedSkills, colWidth);
  const missingChips = layoutChips(doc, input.missingSkills, colWidth);
  const titleBlockHeight = 18 + 10;
  const colHeight = Math.max(
    titleBlockHeight + chipsHeight(matchedChips),
    titleBlockHeight + chipsHeight(missingChips)
  );
  const skillsCardHeight = CARD_PADDING * 2 + colHeight;

  y = ensureSpace(doc, y, skillsCardHeight);
  drawCardShell(doc, y, skillsCardHeight);

  const leftX = MARGIN + CARD_PADDING;
  const rightX = leftX + colWidth + columnGap;
  const titleY = y + CARD_PADDING;
  const chipsY = titleY + titleBlockHeight;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor(INK)
    .text(`Matched Skills (${input.matchedSkills.length})`, leftX, titleY, { width: colWidth });
  drawChips(doc, matchedChips, leftX, chipsY, "#ecfdf5", "#065f46");

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor(INK)
    .text(`Missing Skills (${input.missingSkills.length})`, rightX, titleY, { width: colWidth });
  drawChips(doc, missingChips, rightX, chipsY, "#fffbeb", "#92400e");

  y = y + skillsCardHeight + SECTION_GAP;

  y = renderTextCard(doc, y, "Recommendations", input.recommendations, BODY_TEXT);
  y = renderTextCard(doc, y, "Job Description", input.jobDescription, BODY_TEXT);

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor(MUTED)
    .text("Generated with Resume AI", MARGIN, y);

  doc.end();
  return done;
}
