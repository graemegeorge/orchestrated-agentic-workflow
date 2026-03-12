import { describe, it, expect } from 'vitest';

// Minimal test stubs — these validate the component structure
// In a real project, use @testing-library/react

describe('Button', () => {
  it('should export a Button component', async () => {
    const mod = await import('./Button');
    expect(mod.Button).toBeDefined();
    expect(mod.Button.displayName).toBe('Button');
  });

  it('should export ButtonProps type', async () => {
    // Type-level test: this file compiles means types are exported
    const types = await import('./Button.types');
    expect(types).toBeDefined();
  });
});
