import { Types } from "mongoose";
import { Evaluation, type EvaluationDoc } from "../models/Evaluation.js";
import { extractResumeText, type UploadedFile } from "./resumeParser.service.js";
import { evaluateResume } from "./openaiWrapper.service.js";
import { uploadResumeFile } from "./storage.service.js";

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
  return cleaned || "resume";
}

export async function runEvaluation(
  userId: string,
  file: UploadedFile,
  jobDescription: string
): Promise<EvaluationDoc> {
  const resumeText = await extractResumeText(file);
  const result = await evaluateResume(resumeText, jobDescription);

  // Generated up front so the storage key can live under the evaluation's
  // own id without a second round trip to Mongo.
  const evaluationId = new Types.ObjectId();
  const resumeStorageKey = `resumes/${evaluationId.toString()}/${sanitizeFileName(file.originalname)}`;
  await uploadResumeFile(resumeStorageKey, file.buffer, file.mimetype);

  const evaluation = await Evaluation.create({
    _id: evaluationId,
    userId,
    resumeFileName: file.originalname,
    resumeText,
    resumeStorageKey,
    resumeMimeType: file.mimetype,
    jobTitle: result.jobTitle,
    jobDescription,
    matchScore: result.matchScore,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    recommendations: result.recommendations,
  });

  return evaluation.toObject() as EvaluationDoc;
}
