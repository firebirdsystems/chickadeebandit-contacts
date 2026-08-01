import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, it, expect } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dirname, "../manifest.json"), "utf-8"));

const VALID_STORAGE   = ["kv", "db", "none"];
const VALID_AUDIENCES = ["everyone", "adults", "children"];

describe("manifest.json", () => {
  it("has required string fields", () => {
    for (const field of ["id", "name", "version", "description", "entrypoint", "runtime", "icon"]) {
      expect(manifest[field], `missing field: ${field}`).toBeTruthy();
    }
  });

  it("entrypoint is index.html", () => expect(manifest.entrypoint).toBe("index.html"));
  it("runtime is static",        () => expect(manifest.runtime).toBe("static"));

  it("storage is declared and valid", () => {
    expect(manifest.storage, "storage field is required").toBeTruthy();
    expect(VALID_STORAGE).toContain(manifest.storage);
  });

  it("version follows semver", () => expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/));

  it("permissions.default_audience is valid", () => {
    expect(VALID_AUDIENCES).toContain(manifest.permissions.default_audience);
  });

  it("permissions.requires_approval is boolean", () => {
    expect(typeof manifest.permissions.requires_approval).toBe("boolean");
  });

  it("data_access has reads and writes arrays", () => {
    expect(Array.isArray(manifest.data_access.reads)).toBe(true);
    expect(Array.isArray(manifest.data_access.writes)).toBe(true);
  });
});

// The address book shipped with NO row_policies entry — ungoverned, so any
// member with app access (guests included) could delete every contact in the
// household. Reads stay open, which is the point of a shared directory; what
// the policy adds is that a non-adult may only change rows they created, while
// adults still moderate the whole book. Neither write_owner_only nor
// write_visibility_scoped may be set: the first would strip adults of that
// moderation, the second would hand every reader write access again.
describe("row policy", () => {
  it("governs writes without narrowing reads", () => {
    expect(manifest.row_policies.contacts).toEqual({
      kind: "owner_or_visibility",
      member_column: "created_by",
      visibility_column: "visibility",
      everyone_values: ["everyone"],
    });
  });

  it("defaults every row to household-readable", () => {
    const sql = readFileSync(join(__dirname, "../migrations/003_visibility.sql"), "utf-8");
    expect(sql).toMatch(/ADD COLUMN visibility TEXT NOT NULL DEFAULT 'everyone'/);
  });
});
