import { describe, expect, it } from "vitest";
import { AppError, isAppError } from "../../../src/lib/errors.js";

describe("AppError", () => {
  it("creates error with status code and message", () => {
    const error = new AppError(404, "Not found", "not_found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.code).toBe("not_found");
  });

  it("isAppError identifies AppError instances", () => {
    const appError = new AppError(400, "Bad request");
    const regularError = new Error("Regular error");

    expect(isAppError(appError)).toBe(true);
    expect(isAppError(regularError)).toBe(false);
  });
});

