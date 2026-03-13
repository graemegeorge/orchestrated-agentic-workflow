import Anthropic from '@anthropic-ai/sdk';
import type { ZodSchema } from 'zod';
import type { LlmProvider } from './llm.js';

export interface AnthropicProviderOptions {
  /** Defaults to claude-sonnet-4-6 */
  model?: string;
  /** Max tokens for the response. Defaults to 4096. */
  maxTokens?: number;
}

/**
 * Real LLM provider backed by the Anthropic Messages API.
 *
 * Sends the orchestrator prompt as a user message and parses the
 * JSON response against the Zod schema.
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 */
export class AnthropicProvider implements LlmProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(options: AnthropicProviderOptions = {}) {
    this.client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
    this.model = options.model ?? 'claude-sonnet-4-6';
    this.maxTokens = options.maxTokens ?? 4096;
  }

  async generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system:
        'You are a specialised agent in a multi-stage workflow. ' +
        'Return ONLY valid JSON matching the requested schema. ' +
        'No markdown fences, no explanation — just the JSON object.',
    });

    // Extract text from the response
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Anthropic response contained no text block');
    }

    let raw = textBlock.text.trim();

    // Strip markdown fences if the model included them despite instructions
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(raw);
    return schema.parse(parsed);
  }
}
