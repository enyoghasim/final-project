import { Router } from "express";
import type { EvaluationRecord, PaginatedEvaluations } from "@resume-ai/shared";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Evaluation } from "../models/Evaluation.js";
import { NotFoundError, AppError } from "../utils/errors.js";

const router = Router();

function toRecord(doc: {
  _id: unknown;
  resumeFileName: string;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string;
  createdAt: Date;
}): EvaluationRecord {
  return {
    _id: String(doc._id),
    resumeFileName: doc.resumeFileName,
    jobDescription: doc.jobDescription,
    matchScore: doc.matchScore,
    matchedSkills: doc.matchedSkills,
    missingSkills: doc.missingSkills,
    recommendations: doc.recommendations,
    createdAt: doc.createdAt.toISOString(),
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

export default router;
