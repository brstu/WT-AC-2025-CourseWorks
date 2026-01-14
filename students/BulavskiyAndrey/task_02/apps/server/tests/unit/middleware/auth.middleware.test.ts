import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { authenticate } from "../../../src/middleware/auth.js";
import { signAccessToken } from "../../../src/lib/jwt.js";

describe("authenticate middleware", () => {
  const mockRequest = (headers: Record<string, string>) => {
    return {
      headers,
      user: undefined
    } as unknown as Request;
  };

  const mockResponse = () => {
    return {} as Response;
  };

  const mockNext = vi.fn() as NextFunction;

  it("authenticates valid token", () => {
    const token = signAccessToken({ sub: "user-1", role: "user" });
    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();

    authenticate(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user?.id).toBe("user-1");
  });

  it("rejects missing authorization header", () => {
    const req = mockRequest({});
    const res = mockResponse();

    authenticate(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401
      })
    );
  });

  it("rejects invalid token format", () => {
    const req = mockRequest({ authorization: "Invalid token" });
    const res = mockResponse();

    authenticate(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401
      })
    );
  });
});

