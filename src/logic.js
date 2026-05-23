/**
 * Pure business logic for the Contacts app.
 * No DOM, no fetch — importable in both browser and test environments.
 */

export function categories(contacts) {
  return [...new Set(contacts.map(c => c.category).filter(Boolean))].sort();
}

export function filterContacts(contacts, query, activeCategory) {
  const q = (query || "").trim().toLowerCase();
  return contacts.filter(c => {
    if (activeCategory && c.category !== activeCategory) return false;
    if (!q) return true;
    return [c.displayName, c.email, c.phone, c.address, c.notes]
      .filter(Boolean)
      .some(v => v.toLowerCase().includes(q));
  }).sort((a, b) => a.displayName.localeCompare(b.displayName));
}
