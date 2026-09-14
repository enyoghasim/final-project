import crypto from "node:crypto";
import { Router } from "express";
import type { PublicEvaluation } from "@resume-ai/shared";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/errors.js";
import { Evaluation } from "../models/Evaluation.js";
import { getResumeDownloadUrl } from "../services/storage.service.js";
import { redis } from "../services/redis.service.js";
import { renderEvaluationOgImage } from "../services/ogImage.service.js";
import { pdfFileName, renderEvaluationPdf } from "../services/pdfReport.service.js";
import { publicRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

const NOT_FOUND_MESSAGE = "No evaluation found.";
const VIEW_DEDUPE_TTL_SECONDS = 30 * 60;
const OG_IMAGE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

const WEB_PUBLIC_URL = (env.WEB_PUBLIC_URL ?? env.CORS_ORIGIN[0] ?? "").replace(/\/+$/, "");
const DEFAULT_TITLE = "Resume AI – Match Your Resume to Any Job Instantly";
const DEFAULT_DESCRIPTION =
  "Upload your resume and a job description to get an instant AI match score, skill gap analysis, and tailored recommendations — powered by GPT.";
const DEFAULT_IMAGE = `${WEB_PUBLIC_URL}/og-image.png`;

router.use(publicRateLimiter);

// Anonymizes the viewer for the view-dedupe key instead of storing raw IPs in Redis.
function hashViewer(req: { ip?: string }): string {
  return crypto
    .createHash("sha256")
    .update(req.ip ?? "unknown")
    .digest("hex")
    .slice(0, 24);
}

async function findShared(shareId: string) {
  return Evaluation.findOne({ shareId, isShared: true });
}

router.get(
  "/:shareId",
  asyncHandler(async (req, res) => {
    const evaluation = await findShared(req.params.shareId);
    if (!evaluation) {
      throw new NotFoundError(NOT_FOUND_MESSAGE);
    }

    const dedupeKey = `viewed:${evaluation.shareId}:${hashViewer(req)}`;
    const isNewView = await redis.set(dedupeKey, "1", "EX", VIEW_DEDUPE_TTL_SECONDS, "NX");
    if (isNewView) {
      await Evaluation.updateOne(
        { _id: evaluation._id },
        { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } }
      );
      evaluation.viewCount += 1;
    }

    const record: PublicEvaluation = {
      jobTitle: evaluation.jobTitle,
      jobDescription: evaluation.jobDescription,
      resumeFileName: evaluation.resumeFileName,
      matchScore: evaluation.matchScore,
      matchedSkills: evaluation.matchedSkills,
      missingSkills: evaluation.missingSkills,
      recommendations: evaluation.recommendations,
      createdAt: evaluation.createdAt.toISOString(),
      viewCount: evaluation.viewCount,
    };

    res.status(200).json(record);
  })
);

router.get(
  "/:shareId/resume",
  asyncHandler(async (req, res) => {
    const evaluation = await findShared(req.params.shareId);
    if (!evaluation) {
      throw new NotFoundError(NOT_FOUND_MESSAGE);
    }

    await Evaluation.updateOne({ _id: evaluation._id }, { $inc: { downloadCount: 1 } });

    const url = await getResumeDownloadUrl(evaluation.resumeStorageKey, evaluation.resumeFileName);
    res.redirect(302, url);
  })
);

router.get(
  "/:shareId/pdf",
  asyncHandler(async (req, res) => {
    const evaluation = await findShared(req.params.shareId);
    if (!evaluation) {
      throw new NotFoundError(NOT_FOUND_MESSAGE);
    }

    const pdf = await renderEvaluationPdf({
      jobTitle: evaluation.jobTitle,
      resumeFileName: evaluation.resumeFileName,
      jobDescription: evaluation.jobDescription,
      matchScore: evaluation.matchScore,
      matchedSkills: evaluation.matchedSkills,
      missingSkills: evaluation.missingSkills,
      recommendations: evaluation.recommendations,
      createdAt: evaluation.createdAt,
    });

    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `attachment; filename="${pdfFileName(evaluation.jobTitle)}"`);
    res.status(200).send(pdf);
  })
);

// Rendered on demand and cached in Redis (content is immutable per shareId,
// so there's nothing to invalidate short of the evaluation being un-shared,
// which the findShared() lookup already guards against on every request).
router.get(
  "/:shareId/og-image.png",
  asyncHandler(async (req, res) => {
    const evaluation = await findShared(req.params.shareId);
    if (!evaluation) {
      res.redirect(302, DEFAULT_IMAGE);
      return;
    }

    const cacheKey = `og-image:${evaluation.shareId}`;
    const cached = await redis.getBuffer(cacheKey);
    if (cached) {
      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "public, max-age=86400");
      res.send(cached);
      return;
    }

    const png = renderEvaluationOgImage({
      jobTitle: evaluation.jobTitle,
      matchScore: evaluation.matchScore,
      matchedCount: evaluation.matchedSkills.length,
      missingCount: evaluation.missingSkills.length,
    });

    await redis.set(cacheKey, png, "EX", OG_IMAGE_CACHE_TTL_SECONDS);

    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(png);
  })
);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMetaHtml(input: {
  title: string;
  description: string;
  image: string;
  url: string;
  bodyHtml: string;
}): string {
  const { title, description, image, url, bodyHtml } = input;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Resume AI" />
<meta property="og:url" content="${escapeHtml(url)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<link rel="canonical" href="${escapeHtml(url)}" />
</head>
<body>${bodyHtml}</body>
</html>`;
}

// Serves a small static HTML document with per-evaluation meta tags, used
// only by link-preview crawlers (see apps/web/nginx.conf.template) since
// they don't execute JS and so can't see the SPA's client-rendered <title>.
// Real visitors never hit this route — they get the normal SPA.
router.get(
  "/:shareId/prerender",
  asyncHandler(async (req, res) => {
    const shareId = req.params.shareId;
    const evaluation = await findShared(shareId);
    const pageUrl = `${WEB_PUBLIC_URL}/evaluation/${shareId}`;

    res.set("Content-Type", "text/html; charset=utf-8");

    if (!evaluation) {
      res.status(200).send(
        renderMetaHtml({
          title: DEFAULT_TITLE,
          description: DEFAULT_DESCRIPTION,
          image: DEFAULT_IMAGE,
          url: `${WEB_PUBLIC_URL}/`,
          bodyHtml: `<p>This evaluation link is invalid or is no longer shared.</p><a href="${WEB_PUBLIC_URL}/">Go to Resume AI</a>`,
        })
      );
      return;
    }

    const title = `${evaluation.jobTitle} — Resume Match Evaluation | Resume AI`;
    const description = `This resume scored ${Math.round(evaluation.matchScore)}% match for ${evaluation.jobTitle}. See the full skill breakdown and recommendations.`;
    const image = `${WEB_PUBLIC_URL}/evaluation/${shareId}/og-image.png`;

    res.status(200).send(
      renderMetaHtml({
        title,
        description,
        image,
        url: pageUrl,
        bodyHtml: `<h1>${escapeHtml(evaluation.jobTitle)}</h1><p>${escapeHtml(description)}</p><a href="${pageUrl}">View full evaluation</a>`,
      })
    );
  })
);

export default router;
