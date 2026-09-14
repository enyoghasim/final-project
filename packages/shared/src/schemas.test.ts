import { describe, expect, it } from "vitest";
import { EvaluationResultSchema, SignupInputSchema } from "./schemas.js";

describe("EvaluationResultSchema", () => {
  it("accepts a well-formed evaluation result", () => {
    const result = EvaluationResultSchema.safeParse({
      jobTitle: "Senior Backend Engineer",
      matchScore: 75,
      matchedSkills: ["TypeScript"],
      missingSkills: ["Go"],
      recommendations: "Add more backend experience.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a match score above 100", () => {
    const result = EvaluationResultSchema.safeParse({
      jobTitle: "Senior Backend Engineer",
      matchScore: 150,
      matchedSkills: [],
      missingSkills: [],
      recommendations: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("SignupInputSchema", () => {
  it("rejects passwords shorter than 8 characters", () => {
    const result = SignupInputSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
