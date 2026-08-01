import { describe, it, expect } from "vitest";
import { categories, filterContacts, searchableFields } from "../src/logic.js";

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

  it("returns every contact when no category is active", () => {
    expect(filterContacts(contacts, "")).toHaveLength(3);
  });

  it("sorts by displayName alphabetically", () => {
    expect(filterContacts(contacts, "").map(c => c.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("filters by category", () => {
    expect(filterContacts(contacts, "Work").map(c => c.id)).toEqual(["c1", "c3"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...contacts];
    filterContacts(contacts, "");
    expect(contacts).toEqual(copy);
  });
});

// ── searchableFields ──────────────────────────────────────────────────────────

describe("searchableFields", () => {
  it("reaches past the name — email, phone, address and notes all count", () => {
    const c = contact({
      displayName: "Beth Jones", email: "beth@company.com", phone: "555-1234",
      address: "12 Elm St", notes: "school run carpool",
    });
    const fields = searchableFields(c);
    expect(fields).toContain("beth@company.com");
    expect(fields).toContain("555-1234");
    expect(fields).toContain("12 Elm St");
    expect(fields).toContain("school run carpool");
  });
});
