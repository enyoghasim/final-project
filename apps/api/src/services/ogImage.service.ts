import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1200;
const HEIGHT = 630;
const BG = "#fffaf3";
const INK = "#0f172a";
const MUTED = "#64748b";

export interface OgImageInput {
  jobTitle: string;
  matchScore: number;
  matchedCount: number;
  missingCount: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// SVG <text> doesn't wrap on its own, so lines are broken by an estimated
// character budget rather than measured glyph widths — good enough for a
// social preview image, not meant to be pixel-perfect.
function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return ["Untitled role"];

  const lines: string[] = [];
  let current = "";
  let wordIndex = 0;

  while (wordIndex < words.length && lines.length < maxLines) {
    const word = words[wordIndex];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
      wordIndex++;
    } else {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);

  if (wordIndex < words.length) {
    const last = lines[lines.length - 1] ?? "";
    const trimmed = last.length > maxChars - 1 ? last.slice(0, maxChars - 1).trimEnd() : last;
    lines[lines.length - 1] = `${trimmed}…`;
  }

  return lines;
}

function bandColor(score: number): string {
  if (score < 50) return "#ef4444";
  if (score < 75) return "#d97706";
  return "#059669";
}

function bandLabel(score: number): string {
  if (score < 50) return "NEEDS WORK";
  if (score < 75) return "GOOD MATCH";
  return "GREAT MATCH";
}

export function renderEvaluationOgImage(input: OgImageInput): Buffer {
  const score = Math.round(Math.min(100, Math.max(0, input.matchScore)));
  const color = bandColor(score);
  const titleLines = wrapLines(input.jobTitle || "Untitled role", 26, 2);
  const titleTspans = titleLines
    .map((line, i) => `<tspan x="80" dy="${i === 0 ? 0 : 66}">${escapeXml(line)}</tspan>`)
    .join("");

  const circleCx = 970;
  const circleCy = 300;
  const circleR = 130;
  const circumference = 2 * Math.PI * circleR;
  const offset = circumference - (score / 100) * circumference;

  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}" />
  <rect x="20" y="20" width="${WIDTH - 40}" height="${HEIGHT - 40}" rx="28" fill="#ffffff" stroke="${INK}" stroke-width="6" />

  <rect x="80" y="72" width="18" height="18" fill="#ff90e8" stroke="${INK}" stroke-width="3" />
  <text x="110" y="88" font-family="sans-serif" font-weight="800" font-size="24" fill="${INK}">RESUME AI</text>

  <text font-family="sans-serif" font-weight="600" font-size="26" fill="${MUTED}" x="80" y="180">Resume match evaluation</text>
  <text font-family="sans-serif" font-weight="800" font-size="54" fill="${INK}" x="80" y="250">${titleTspans}</text>

  <circle cx="${circleCx}" cy="${circleCy}" r="${circleR}" fill="none" stroke="#e2e8f0" stroke-width="18" />
  <circle cx="${circleCx}" cy="${circleCy}" r="${circleR}" fill="none" stroke="${color}" stroke-width="18"
    stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
    transform="rotate(-90 ${circleCx} ${circleCy})" />
  <text x="${circleCx}" y="${circleCy + 18}" font-family="sans-serif" font-weight="800" font-size="80" fill="${INK}" text-anchor="middle">${score}</text>
  <text x="${circleCx}" y="${circleCy + 60}" font-family="sans-serif" font-weight="700" font-size="22" fill="${MUTED}" text-anchor="middle">MATCH SCORE</text>
  <text x="${circleCx}" y="${circleCy + circleR + 56}" font-family="sans-serif" font-weight="800" font-size="24" fill="${color}" text-anchor="middle">${escapeXml(bandLabel(score))}</text>

  <rect x="80" y="480" width="270" height="60" rx="30" fill="#ecfdf5" stroke="${INK}" stroke-width="3" />
  <text x="105" y="518" font-family="sans-serif" font-weight="700" font-size="24" fill="#047857">${input.matchedCount} skills matched</text>

  <rect x="370" y="480" width="290" height="60" rx="30" fill="#fef2f2" stroke="${INK}" stroke-width="3" />
  <text x="395" y="518" font-family="sans-serif" font-weight="700" font-size="24" fill="#b91c1c">${input.missingCount} skills to grow</text>
</svg>`;

  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "sans-serif",
    },
    fitTo: { mode: "width", value: WIDTH },
  });

  return resvg.render().asPng();
}
