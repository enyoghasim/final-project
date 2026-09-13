import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError, setUnauthorizedHandler } from "../apiClient";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequest 401 handling", () => {
  beforeEach(() => {
    localStorage.clear();
    setUnauthorizedHandler(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("surfaces the server's real message and does not fire onUnauthorized for a 401 on an unauthenticated request (e.g. wrong login password)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(401, { error: "Invalid email or password." }))
    );
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(
      apiRequest("/api/auth/login", { method: "POST", body: { email: "a@b.com", password: "x" } })
    ).rejects.toMatchObject({ message: "Invalid email or password.", status: 401 });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("treats a 401 as session expiry and fires onUnauthorized when a token was attached", async () => {
    localStorage.setItem("token", "some-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(401, { error: "Invalid or expired token" }))
    );
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(apiRequest("/api/history")).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
