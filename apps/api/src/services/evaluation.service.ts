import { Evaluation, type EvaluationDoc } from "../models/Evaluation.js";
import { extractResumeText, type UploadedFile } from "./resumeParser.service.js";
import { evaluateResume } from "./openaiWrapper.service.js";

export async function runEvaluation(
  userId: string,
  file: UploadedFile,
  jobDescription: string
): Promise<EvaluationDoc> {
  const resumeText = await extractResumeText(file);
  const result = await evaluateResume(resumeText, jobDescription);

  const evaluation = await Evaluation.create({
    userId,
    resumeFileName: file.originalname,
    resumeText,
    jobDescription,
    matchScore: result.matchScore,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    recommendations: result.recommendations,
  });

  return evaluation.toObject() as EvaluationDoc;
}
