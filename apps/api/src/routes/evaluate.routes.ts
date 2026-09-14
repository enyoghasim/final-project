import { Router } from "express";
import type { EvaluationRecord } from "@resume-ai/shared";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadResume } from "../middleware/upload.middleware.js";
import { evaluateRateLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { runEvaluation } from "../services/evaluation.service.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  evaluateRateLimiter,
  uploadResume,
  asyncHandler(async (req, res) => {
    const rawJobDescription = req.body.jobDescription;
    if (typeof rawJobDescription !== "string" || !rawJobDescription.trim()) {
      throw new AppError("Job description is required.", 400);
    }
    const jobDescription = rawJobDescription.trim();
    if (!req.file) {
      throw new AppError("A resume file is required.", 400);
    }
    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const evaluation = await runEvaluation(
      req.userId,
      {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      },
      jobDescription
    );

    const record: EvaluationRecord = {
      _id: evaluation._id.toString(),
      jobTitle: evaluation.jobTitle,
      resumeFileName: evaluation.resumeFileName,
      jobDescription: evaluation.jobDescription,
      matchScore: evaluation.matchScore,
      matchedSkills: evaluation.matchedSkills,
      missingSkills: evaluation.missingSkills,
      recommendations: evaluation.recommendations,
      createdAt: evaluation.createdAt.toISOString(),
      isShared: evaluation.isShared,
      shareId: evaluation.shareId ?? null,
      viewCount: evaluation.viewCount,
    };

    res.status(201).json(record);
  })
);

export default router;
