import { describe, it, expect } from "vitest";
import { ageGroupLabel, honorificFor } from "../helpers";

describe("honorificFor", () => {
  it("returns Dra. when gender is female", () => {
    expect(honorificFor("Maria Lopez", "femenino")).toBe("Dra.");
    expect(honorificFor("Maria Lopez", "F")).toBe("Dra.");
    expect(honorificFor("Maria Lopez", "female")).toBe("Dra.");
  });

  it("returns Dr. when gender is male", () => {
    expect(honorificFor("Juan Lopez", "masculino")).toBe("Dr.");
    expect(honorificFor("Juan Lopez", "M")).toBe("Dr.");
    expect(honorificFor("Juan Lopez", "male")).toBe("Dr.");
  });

  it("falls back to first-name heuristic when gender is missing", () => {
    expect(honorificFor("Laura Diaz")).toBe("Dra.");
    expect(honorificFor("Carlos Diaz")).toBe("Dr.");
  });

  it("does not crash on empty input", () => {
    expect(honorificFor("")).toBe("Dr.");
  });
});

describe("ageGroupLabel", () => {
  it("maps known canonical codes to Spanish labels", () => {
    expect(ageGroupLabel("pediatric")).toBe("Pediátrico");
    expect(ageGroupLabel("adult")).toBe("Adultos");
    expect(ageGroupLabel("senior")).toBe("Adultos mayores");
  });

  it("returns the original string when the code is unknown", () => {
    expect(ageGroupLabel("Recién nacidos")).toBe("Recién nacidos");
    expect(ageGroupLabel("post-quirurgico")).toBe("post-quirurgico");
  });
});
