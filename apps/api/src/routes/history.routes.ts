import { Router } from "express";
import { nanoid } from "nanoid";
import type { EvaluationRecord, PaginatedEvaluations, ShareStatus } from "@resume-ai/shared";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Evaluation } from "../models/Evaluation.js";
import { NotFoundError, AppError } from "../utils/errors.js";
import { pdfFileName, renderEvaluationPdf } from "../services/pdfReport.service.js";

const router = Router();

function toRecord(doc: {
  _id: unknown;
  jobTitle: string;
  resumeFileName: string;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string;
  createdAt: Date;
  isShared: boolean;
  shareId?: string | null;
  viewCount: number;
}): EvaluationRecord {
  return {
    _id: String(doc._id),
    jobTitle: doc.jobTitle,
    resumeFileName: doc.resumeFileName,
    jobDescription: doc.jobDescription,
    matchScore: doc.matchScore,
    matchedSkills: doc.matchedSkills,
    missingSkills: doc.missingSkills,
    recommendations: doc.recommendations,
    createdAt: doc.createdAt.toISOString(),
    isShared: doc.isShared,
    shareId: doc.shareId ?? null,
    viewCount: doc.viewCount,
  };
}

router.use(authMiddleware);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(String(req.query.limit ?? "10"), 10) || 10)
    );

    const [items, total] = await Promise.all([
      Evaluation.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Evaluation.countDocuments({ userId: req.userId }),
    ]);

    const response: PaginatedEvaluations = {
      items: items.map(toRecord),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
    res.status(200).json(response);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
    }
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!evaluation) {
      throw new NotFoundError("Evaluation not found.");
    }
    res.status(200).json(toRecord(evaluation));
  })
);

router.get(
  "/:id/pdf",
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
    }
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!evaluation) {
      throw new NotFoundError("Evaluation not found.");
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

router.post(
  "/:id/share",
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
    }
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!evaluation) {
      throw new NotFoundError("Evaluation not found.");
    }

    // Re-enabling a previously revoked share keeps the same link rather than
    // minting a new one, so any copy already handed out stays valid.
    if (!evaluation.shareId) {
      evaluation.shareId = nanoid(12);
    }
    evaluation.isShared = true;
    evaluation.sharedAt = new Date();
    await evaluation.save();

    const response: ShareStatus = {
      shareId: evaluation.shareId,
      isShared: evaluation.isShared,
      sharePath: `/evaluation/${evaluation.shareId}`,
    };
    res.status(200).json(response);
  })
);

router.delete(
  "/:id/share",
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
    }
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!evaluation) {
      throw new NotFoundError("Evaluation not found.");
    }

    evaluation.isShared = false;
    await evaluation.save();

    const response: ShareStatus = {
      shareId: evaluation.shareId ?? "",
      isShared: false,
      sharePath: evaluation.shareId ? `/evaluation/${evaluation.shareId}` : "",
    };
    res.status(200).json(response);
  })
);

export default router;
