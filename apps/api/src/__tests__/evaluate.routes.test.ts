import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

const fakeEvaluationResult = {
  matchScore: 82,
  matchedSkills: ["TypeScript", "React"],
  missingSkills: ["Kubernetes"],
  recommendations: "Highlight your container orchestration experience.",
};

vi.mock("../services/openaiWrapper.service.js", () => ({
  evaluateResume: vi.fn().mockResolvedValue(fakeEvaluationResult),
}));

vi.mock("../services/resumeParser.service.js", () => ({
  extractResumeText: vi.fn().mockResolvedValue("Experienced software engineer..."),
}));

const savedDoc = {
  _id: { toString: () => "507f1f77bcf86cd799439011" },
  resumeFileName: "resume.pdf",
  jobDescription: "We need a TypeScript engineer.",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  ...fakeEvaluationResult,
};

vi.mock("../models/Evaluation.js", () => ({
  Evaluation: {
    create: vi.fn().mockResolvedValue({
      toObject: () => savedDoc,
    }),
  },
}));

const { createApp } = await import("../app.js");

function authHeader(userId = "507f1f77bcf86cd799439012") {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
}

describe("POST /api/evaluate", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without a token", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .field("jobDescription", "We need a TypeScript engineer.")
      .attach("resume", Buffer.from("fake pdf"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(401);
  });

  it("returns 400 when the job description is missing", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .set("Authorization", authHeader())
      .attach("resume", Buffer.from("fake pdf"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/job description/i);
  });

  it("returns 400 (not a 500) when jobDescription is submitted as multiple form fields", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .set("Authorization", authHeader())
      .field("jobDescription", ["first value", "second value"])
      .attach("resume", Buffer.from("fake pdf"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/job description/i);
  });

  it("returns 400 when the resume file is missing", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .set("Authorization", authHeader())
      .field("jobDescription", "We need a TypeScript engineer.");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/resume file/i);
  });

  it("returns 201 with a well-formed evaluation record on success", async () => {
    const res = await request(app)
      .post("/api/evaluate")
      .set("Authorization", authHeader())
      .field("jobDescription", "We need a TypeScript engineer.")
      .attach("resume", Buffer.from("fake pdf"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      _id: "507f1f77bcf86cd799439011",
      resumeFileName: "resume.pdf",
      matchScore: 82,
      matchedSkills: ["TypeScript", "React"],
      missingSkills: ["Kubernetes"],
    });
  });
});
