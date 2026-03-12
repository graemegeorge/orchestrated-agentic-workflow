import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * Writes a JSON artefact to the given directory.
 */
export async function writeArtefact(
  dir: string,
  filename: string,
  data: unknown,
): Promise<string> {
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}

/**
 * Writes a raw string file (e.g. source code) to a path relative to a base directory.
 */
export async function writeCodeFile(
  baseDir: string,
  relativePath: string,
  content: string,
): Promise<string> {
  const filePath = join(baseDir, relativePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Writes a markdown artefact (raw string, not JSON).
 */
export async function writeMarkdownArtefact(
  dir: string,
  filename: string,
  content: string,
): Promise<string> {
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, filename);
  await writeFile(filePath, content, 'utf-8');
  return filePath;
}
