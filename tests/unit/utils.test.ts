/**
 * tests/unit/utils.test.ts
 * Unit tests for utility functions
 */
import { truncate, traitLabel, importanceVariant, initials } from "@/lib/utils";

describe("truncate", () => {
  it("returns the original string when shorter than limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });
  it("truncates and appends ellipsis when over limit", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
  });
  it("handles empty string", () => {
    expect(truncate("", 10)).toBe("");
  });
});

describe("traitLabel", () => {
  it("returns 'Very High' for values >= 0.8", () => {
    expect(traitLabel(0.8)).toBe("Very High");
    expect(traitLabel(1.0)).toBe("Very High");
  });
  it("returns 'Moderate' for values around 0.5", () => {
    expect(traitLabel(0.5)).toBe("Moderate");
  });
  it("returns 'Very Low' for values < 0.2", () => {
    expect(traitLabel(0.1)).toBe("Very Low");
    expect(traitLabel(0.0)).toBe("Very Low");
  });
});

describe("importanceVariant", () => {
  it("returns 'high' for scores >= 0.75", () => {
    expect(importanceVariant(0.9)).toBe("high");
    expect(importanceVariant(0.75)).toBe("high");
  });
  it("returns 'medium' for mid-range scores", () => {
    expect(importanceVariant(0.5)).toBe("medium");
  });
  it("returns 'low' for scores < 0.4", () => {
    expect(importanceVariant(0.2)).toBe("low");
  });
});

describe("initials", () => {
  it("returns first two characters uppercased", () => {
    expect(initials("alice")).toBe("AL");
    expect(initials("Bob Smith")).toBe("BO");
  });
  it("handles single character", () => {
    expect(initials("x")).toBe("X");
  });
});
