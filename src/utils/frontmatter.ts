/**
 * Parses JSON frontmatter delimited by `---` from a markdown string.
 *
 * Format:
 * ```
 * ---
 * { "key": "value" }
 * ---
 * Markdown body here
 * ```
 */
export function parseFrontmatter(raw: string): { data: unknown; body: string } {
  const trimmed = raw.trim();

  if (!trimmed.startsWith('---')) {
    return { data: {}, body: trimmed };
  }

  const secondDelimiter = trimmed.indexOf('---', 3);
  if (secondDelimiter === -1) {
    throw new Error('Frontmatter: missing closing --- delimiter');
  }

  const frontmatterRaw = trimmed.slice(3, secondDelimiter).trim();
  const body = trimmed.slice(secondDelimiter + 3).trim();

  let data: unknown;
  try {
    data = JSON.parse(frontmatterRaw);
  } catch (err) {
    throw new Error(`Frontmatter: invalid JSON — ${(err as Error).message}`);
  }

  return { data, body };
}
