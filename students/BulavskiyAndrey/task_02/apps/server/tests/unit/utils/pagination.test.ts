import { describe, expect, it } from "vitest";
import { buildPagination } from "../../../src/lib/pagination.js";

describe("buildPagination", () => {
  it("returns default pagination", () => {
    const result = buildPagination();
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it("handles page and pageSize", () => {
    const result = buildPagination(2, 10);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.skip).toBe(10);
    expect(result.take).toBe(10);
  });

  it("clamps pageSize to max 100", () => {
    const result = buildPagination(1, 200);
    expect(result.pageSize).toBe(100);
    expect(result.take).toBe(100);
  });

  it("handles string inputs", () => {
    const result = buildPagination("3", "15");
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(15);
    expect(result.skip).toBe(30);
  });
});

