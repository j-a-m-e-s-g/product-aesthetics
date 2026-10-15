// Reads James's picks from the Google Doc "Product aesthetics: free design
// resources you can use without credit" (tab "Tick what you want").
//
// Claude exports the doc as Markdown through the Google Drive connector and
// saves it; this module only parses that file. In the export every pick is a
// checklist line, "- [ ] 12 Satori: …" or "- [x] 12 Satori: …", and every
// resource also appears in a table as "[**Name**](url)", which gives the list
// of known names (some contain colons) and their links.

const unescape = (s) => s.replace(/\\([\\[\]()*_&#.!+-])/g, '$1');

/** @returns {{ picks: {name: string, url: string|null, ticked: boolean, rank: number|null}[], unmatched: string[] }} */
export function parsePicks(markdown) {
  const urls = new Map();
  for (const m of markdown.matchAll(/\[\*\*(.+?)\*\*\]\((https?:[^)\s]+)\)/g)) {
    const name = unescape(m[1]);
    if (!urls.has(name)) urls.set(name, m[2]);
  }
  const known = [...urls.keys()].sort((a, b) => b.length - a.length); // longest first
  const picks = [];
  const unmatched = [];
  for (const raw of markdown.split('\n')) {
    const m = raw.match(/^\s*[-*] \[( |x|X)\] (.*?)\s*$/);
    if (!m) continue;
    // Google strikes ticked lines through, which the export writes as ~~…~~.
    let text = unescape(m[2].replace(/^~~(.*)~~$/, '$1')).trim();
    const rank = text.match(/^(\d+) /);
    if (rank) text = text.slice(rank[0].length);
    const name = known.find((n) => text === n || text.startsWith(`${n}:`));
    if (!name) {
      unmatched.push(text);
      continue;
    }
    picks.push({ name, url: urls.get(name), ticked: m[1] !== ' ', rank: rank ? Number(rank[1]) : null });
  }
  return { picks, unmatched };
}

const norm = (s) => s.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Compare picks with the catalogue. An entry matches a pick by its `pick`
 * field if set, else by name. Only entries added from the doc (`from_picks`)
 * are offered for removal when unticked.
 */
export function diffPicks(picks, entries) {
  const byKey = new Map(entries.map((e) => [norm(e.pick ?? e.name), e]));
  const add = [];
  const have = [];
  const unticked = [];
  for (const p of picks) {
    const e = byKey.get(norm(p.name));
    if (p.ticked) (e ? have : add).push({ ...p, id: e?.id });
    else if (e?.from_picks) unticked.push({ ...p, id: e.id });
  }
  return { add, have, unticked };
}
