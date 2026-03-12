import type { ZodSchema } from 'zod';

/**
 * Minimal LLM provider interface.
 *
 * The `schema` parameter enables:
 * - The fake adapter to self-validate fixtures
 * - Real adapters to use structured output / JSON mode
 */
export interface LlmProvider {
  generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;
}
