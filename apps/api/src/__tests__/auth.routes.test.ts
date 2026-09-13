import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";

const findOneMock = vi.fn();
const createMock = vi.fn();

vi.mock("../models/User.js", () => ({
  User: {
    findOne: (...args: unknown[]) => findOneMock(...args),
    create: (...args: unknown[]) => createMock(...args),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

const { createApp } = await import("../app.js");
const bcrypt = (await import("bcrypt")).default;

describe("auth routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/signup", () => {
    it("returns 201 with a token and never leaks the password hash", async () => {
      findOneMock.mockResolvedValue(null);
      createMock.mockResolvedValue({
        id: "507f1f77bcf86cd799439011",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
      });

      const res = await request(app).post("/api/auth/signup").send({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user).toEqual({
        id: "507f1f77bcf86cd799439011",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
      });
      expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|hashed-password/);
    });

    it("returns 409 when the pre-check finds an existing user", async () => {
      findOneMock.mockResolvedValue({ id: "existing-user" });

      const res = await request(app).post("/api/auth/signup").send({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(createMock).not.toHaveBeenCalled();
    });

    it("returns 409 (not a raw 500) when two signups race past the pre-check and MongoDB rejects the duplicate key", async () => {
      findOneMock.mockResolvedValue(null);
      createMock.mockRejectedValue(
        Object.assign(new Error("E11000 duplicate key error"), {
          code: 11000,
          keyValue: { email: "ada@example.com" },
        })
      );

      const res = await request(app).post("/api/auth/signup").send({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns a generic 401 for a nonexistent email", async () => {
      findOneMock.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid email or password.");
    });

    it("returns the same generic 401 for a wrong password (doesn't reveal which part was wrong)", async () => {
      findOneMock.mockResolvedValue({
        id: "507f1f77bcf86cd799439011",
        passwordHash: "hashed-password",
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "ada@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid email or password.");
    });

    it("returns 200 with a token on success", async () => {
      findOneMock.mockResolvedValue({
        id: "507f1f77bcf86cd799439011",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        passwordHash: "hashed-password",
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "ada@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
    });
  });
});
