import { z } from "zod";

export const EvaluationResultSchema = z.object({
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

export const EvaluationRecordSchema = EvaluationResultSchema.extend({
  _id: z.string(),
  resumeFileName: z.string(),
  jobDescription: z.string(),
  createdAt: z.string(),
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
