import { z } from "zod";

export const EvaluationResultSchema = z.object({
  jobTitle: z.string().min(1),
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.string(),
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

export const SignupInputSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignupInput = z.infer<typeof SignupInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: AuthUserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const AuthConfigSchema = z.object({
  signupDisabled: z.boolean(),
});
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const EvaluationRecordSchema = EvaluationResultSchema.extend({
  _id: z.string(),
  resumeFileName: z.string(),
  jobDescription: z.string(),
  createdAt: z.string(),
  isShared: z.boolean(),
  shareId: z.string().nullable(),
  viewCount: z.number(),
});
export type EvaluationRecord = z.infer<typeof EvaluationRecordSchema>;

export const PaginatedEvaluationsSchema = z.object({
  items: z.array(EvaluationRecordSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PaginatedEvaluations = z.infer<typeof PaginatedEvaluationsSchema>;

// What an unauthenticated viewer gets from a share link: the evaluation's
// content, but never resumeText (the raw parsed resume) or userId — the
// original file is only reachable through the one-time download redirect.
export const PublicEvaluationSchema = EvaluationResultSchema.extend({
  jobDescription: z.string(),
  resumeFileName: z.string(),
  createdAt: z.string(),
  viewCount: z.number(),
});
export type PublicEvaluation = z.infer<typeof PublicEvaluationSchema>;

export const ShareStatusSchema = z.object({
  shareId: z.string(),
  isShared: z.boolean(),
  sharePath: z.string(),
});
export type ShareStatus = z.infer<typeof ShareStatusSchema>;
