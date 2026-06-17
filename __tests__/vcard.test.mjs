import { describe, it, expect } from "vitest";
import { parseVCards } from "../src/logic.js";

describe("parseVCards", () => {
  it("parses a minimal vCard with FN", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice Smith\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe("Alice Smith");
  });

  it("falls back to N field when FN is absent", () => {
    const vcf = `BEGIN:VCARD\nN:Smith;Alice;;;\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].displayName).toBe("Alice Smith");
  });

  it("falls back to N with single part when FN is absent", () => {
    const vcf = `BEGIN:VCARD\nN:Cher;;;;\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].displayName).toBe("Cher");
  });

  it("prefers FN over N", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice Smith\nN:Smith;Alice;;;\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].displayName).toBe("Alice Smith");
  });

  it("skips cards with no usable name", () => {
    const vcf = `BEGIN:VCARD\nEMAIL:nobody@example.com\nEND:VCARD`;
    expect(parseVCards(vcf)).toHaveLength(0);
  });

  it("extracts the first email from multiple EMAIL lines", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice\nEMAIL;TYPE=work:work@example.com\nEMAIL;TYPE=home:home@example.com\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].email).toBe("work@example.com");
  });

  it("extracts phone from TEL field", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice\nTEL;TYPE=cell:555-1234\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].phone).toBe("555-1234");
  });

  it("takes first phone when multiple TEL lines exist", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice\nTEL:111-0000\nTEL:222-0000\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].phone).toBe("111-0000");
  });

  it("parses ADR field, joining non-empty parts with ', '", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice\nADR:;;123 Main St;Springfield;IL;62701;USA\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].address).toBe("123 Main St, Springfield, IL, 62701, USA");
  });

  it("leaves address undefined when ADR is absent", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice\nEND:VCARD`;
    expect(parseVCards(vcf)[0].address).toBeUndefined();
  });

  it("parses NOTE field", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice\nNOTE:Friend from college\nEND:VCARD`;
    expect(parseVCards(vcf)[0].notes).toBe("Friend from college");
  });

  it("parses CATEGORIES, taking the first value", () => {
    const vcf = `BEGIN:VCARD\nFN:Alice\nCATEGORIES:friends,family\nEND:VCARD`;
    expect(parseVCards(vcf)[0].category).toBe("friends");
  });

  it("parses multiple vCards from one .vcf file", () => {
    const vcf = [
      "BEGIN:VCARD\nFN:Alice\nEND:VCARD",
      "BEGIN:VCARD\nFN:Bob\nEND:VCARD",
      "BEGIN:VCARD\nFN:Carol\nEND:VCARD",
    ].join("\n");
    const result = parseVCards(vcf);
    expect(result).toHaveLength(3);
    expect(result.map(r => r.displayName)).toEqual(["Alice", "Bob", "Carol"]);
  });

  it("unfolds continuation lines (RFC 6350 line folding)", () => {
    const vcf = "BEGIN:VCARD\r\nFN:Alice\r\nNOTE:This is a long note\r\n that continues here\r\nEND:VCARD";
    const result = parseVCards(vcf);
    expect(result[0].notes).toBeTruthy();
  });

  it("is case-insensitive for field names", () => {
    const vcf = `BEGIN:VCARD\nfn:Alice\nemail:alice@example.com\nEND:VCARD`;
    const result = parseVCards(vcf);
    expect(result[0].displayName).toBe("Alice");
    expect(result[0].email).toBe("alice@example.com");
  });

  it("returns empty array for empty input", () => {
    expect(parseVCards("")).toHaveLength(0);
  });

  it("returns empty array when no valid vCard blocks found", () => {
    expect(parseVCards("not a vcard at all")).toHaveLength(0);
  });
});
