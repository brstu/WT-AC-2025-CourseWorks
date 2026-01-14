import { describe, expect, it } from "vitest";
import { sha256 } from "../../../src/lib/hash.js";

describe("sha256", () => {
  it("produces deterministic hex hashes", () => {
    const first = sha256("hello");
    const second = sha256("hello");
    const different = sha256("world");

    expect(first).toBe(second);
    expect(first).not.toBe(different);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});

