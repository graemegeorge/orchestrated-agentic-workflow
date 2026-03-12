import { describe, it, expect } from 'vitest';
import {
  SpecOutputSchema,
  ImplementOutputSchema,
  IntakeOutputSchema,
} from '../src/orchestrator/schemas.js';

describe('schemas', () => {
  it('should validate a correct SpecOutput payload', () => {
    const valid = {
      componentName: 'Button',
      props: [
        {
          name: 'variant',
          type: "'primary' | 'secondary'",
          required: false,
          default: "'primary'",
          description: 'Visual style',
        },
      ],
      variants: [{ name: 'variant', values: ['primary', 'secondary'] }],
      accessibility: {
        role: 'button',
        ariaAttributes: ['aria-disabled'],
        keyboardInteractions: [{ key: 'Enter', action: 'Activate' }],
      },
      themingNotes: 'Uses CSS custom properties',
      acceptanceCriteria: ['Renders as <button>'],
    };

    const result = SpecOutputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject a SpecOutput payload missing required fields', () => {
    const invalid = {
      componentName: 'Button',
      // missing: props, variants, accessibility, themingNotes, acceptanceCriteria
    };

    const result = SpecOutputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject ImplementOutput with empty files array', () => {
    const invalid = {
      files: [],
    };

    const result = ImplementOutputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate a correct IntakeOutput payload', () => {
    const valid = {
      componentName: 'Card',
      description: 'A card component',
      requirements: ['Has header and body'],
      constraints: ['React 18+'],
    };

    const result = IntakeOutputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
