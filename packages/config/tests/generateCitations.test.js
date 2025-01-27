import fs from "node:fs";

import generateCitations from "../generateCitations";

// Mock filesystem
jest.mock("node:fs");
jest.mock("app-root-path", () => ({
  path: "/mock/root/path",
}));

describe("generateCitations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validCitationCff = `
cff-version: 1.2.0
message: Please cite this software using these metadata
title: Test Software
authors:
  - family-names: Doe
    given-names: John
version: 1.0.0
date-released: 2023-01-01
  `;

  const citationCffWithPreferred = `
cff-version: 1.2.0
message: Please cite this software using these metadata
title: Test Software
authors:
  - family-names: Doe
    given-names: John
preferred-citation:
  title: Preferred Citation
  authors:
    - family-names: Smith
      given-names: Jane
  `;

  test("should generate citations when CITATION.cff exists in current directory", () => {
    fs.readFileSync.mockReturnValue(validCitationCff);

    const result = generateCitations();

    expect(result).toHaveProperty("apa");
    expect(result).toHaveProperty("bibtex");
    expect(result.apa).not.toBe("");
    expect(result.bibtex).not.toBe("");
  });

  test("should handle preferred-citation when present", () => {
    fs.readFileSync.mockReturnValue(citationCffWithPreferred);

    const result = generateCitations();

    expect(result).toHaveProperty("apa");
    expect(result).toHaveProperty("bibtex");
    expect(result.apa.includes("Smith")).toBeTruthy();
  });

  test("should return empty strings when CITATION.cff is not found", () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error("File not found");
    });

    const result = generateCitations();

    expect(result).toEqual({
      apa: "",
      bibtex: "",
    });
  });

  test("should handle malformed CITATION.cff", () => {
    fs.readFileSync.mockReturnValue("invalid: yaml: content:");

    const result = generateCitations();

    expect(result).toEqual({
      apa: "",
      bibtex: "",
    });
  });

  test("should remove newlines from citations", () => {
    fs.readFileSync.mockReturnValue(validCitationCff);

    const result = generateCitations();

    expect(result.apa).not.toMatch(/\n/);
    expect(result.bibtex).not.toMatch(/\n/);
  });
});
