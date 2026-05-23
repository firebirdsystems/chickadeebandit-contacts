import { describe, it, expect } from "vitest";
import { categories, filterContacts } from "../src/logic.js";

function contact(overrides = {}) {
  return {
    id: "c1", displayName: "Alex Smith",
    email: "", phone: "", address: "", notes: "", category: "",
    ...overrides,
  };
}

// ── categories ────────────────────────────────────────────────────────────────

describe("categories", () => {
  it("returns unique, sorted categories", () => {
    const contacts = [
      contact({ category: "Work" }),
      contact({ category: "Family" }),
      contact({ category: "Work" }),
      contact({ category: "Friends" }),
    ];
    expect(categories(contacts)).toEqual(["Family", "Friends", "Work"]);
  });

  it("excludes contacts with no category", () => {
    const contacts = [
      contact({ category: "" }),
      contact({ category: null }),
      contact({ category: "Work" }),
    ];
    expect(categories(contacts)).toEqual(["Work"]);
  });

  it("returns empty array for empty list", () => {
    expect(categories([])).toEqual([]);
  });
});

// ── filterContacts ────────────────────────────────────────────────────────────

describe("filterContacts", () => {
  const contacts = [
    contact({ id: "c1", displayName: "Alex Smith",   email: "alex@example.com",   category: "Work" }),
    contact({ id: "c2", displayName: "Beth Jones",   phone: "555-1234",            category: "Family" }),
    contact({ id: "c3", displayName: "Chris Walker", email: "chris@company.com",  category: "Work" }),
  ];

  it("returns all contacts when query and category are empty", () => {
    const result = filterContacts(contacts, "", "");
    expect(result).toHaveLength(3);
  });

  it("sorts by displayName alphabetically", () => {
    const result = filterContacts(contacts, "", "");
    expect(result.map(c => c.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("filters by category", () => {
    const result = filterContacts(contacts, "", "Work");
    expect(result.map(c => c.id)).toEqual(["c1", "c3"]);
  });

  it("filters by search query on displayName", () => {
    const result = filterContacts(contacts, "beth", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c2");
  });

  it("filters by search query on email", () => {
    const result = filterContacts(contacts, "company.com", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c3");
  });

  it("filters by search query on phone", () => {
    const result = filterContacts(contacts, "555", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c2");
  });

  it("applies both category and query filters", () => {
    const result = filterContacts(contacts, "alex", "Work");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterContacts(contacts, "xyz", "")).toHaveLength(0);
  });

  it("does not mutate the input array", () => {
    const copy = [...contacts];
    filterContacts(contacts, "alex", "");
    expect(contacts).toEqual(copy);
  });
});
