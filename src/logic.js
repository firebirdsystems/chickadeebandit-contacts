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

/**
 * Parse a .vcf file containing one or more vCards.
 * Handles vCard 2.1, 3.0, and 4.0.
 * @param {string} vcfText
 * @returns {{ displayName: string; email?: string; phone?: string; address?: string; notes?: string; category?: string }[]}
 */
export function parseVCards(vcfText) {
  const results = [];
  const blocks = vcfText.split(/END:VCARD/i).map(b => b.trim()).filter(Boolean);

  for (const block of blocks) {
    const unfolded = block.replace(/\r?\n[ \t]/g, '');
    const lines = unfolded.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const get = prefix =>
      lines.find(l => {
        const upper = l.toUpperCase();
        return upper.startsWith(prefix.toUpperCase() + ':') ||
               upper.startsWith(prefix.toUpperCase() + ';');
      })?.replace(/^[^:]+:/i, '').trim() ?? null;

    const getAll = prefix =>
      lines
        .filter(l => {
          const upper = l.toUpperCase();
          return upper.startsWith(prefix.toUpperCase() + ':') ||
                 upper.startsWith(prefix.toUpperCase() + ';');
        })
        .map(l => l.replace(/^[^:]+:/i, '').trim());

    const fn = get('FN');
    const n  = get('N');
    let displayName = fn ?? '';
    if (!displayName && n) {
      const parts = n.split(';').map(p => p.trim()).filter(Boolean);
      displayName = parts.length >= 2 ? `${parts[1]} ${parts[0]}`.trim() : parts[0] ?? '';
    }
    if (!displayName) continue;

    const email = getAll('EMAIL')[0] ?? undefined;
    const phone = getAll('TEL')[0] ?? undefined;

    const adrRaw = get('ADR');
    const address = adrRaw
      ? adrRaw.split(';').map(p => p.trim()).filter(Boolean).join(', ') || undefined
      : undefined;

    const notes    = get('NOTE') ?? undefined;
    const cats     = get('CATEGORIES');
    const category = cats ? cats.split(',')[0].trim() : undefined;

    results.push({ displayName, email, phone, address, notes, category });
  }

  return results;
}
