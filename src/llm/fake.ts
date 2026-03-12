import type { ZodSchema } from 'zod';
import type { LlmProvider } from './llm.js';
import type {
  IntakeOutput,
  SpecOutput,
  ImplementOutput,
  ReviewOutput,
  DeliverOutput,
} from '../orchestrator/schemas.js';

// ---------------------------------------------------------------------------
// Hardcoded fixtures — plausible Button component data
// ---------------------------------------------------------------------------

const intakeFixture: IntakeOutput = {
  componentName: 'Button',
  description:
    'A composable Button component with multiple variants, sizes, loading state, and optional icon slots. Compatible with Radix/shadcn composability patterns.',
  requirements: [
    'Support variant prop with values: primary, secondary, ghost',
    'Support size prop with values: sm, md, lg',
    'Support loading state that disables interaction and shows a spinner',
    'Support optional leftIcon and rightIcon slots',
    'Use forwardRef for ref forwarding',
    'API should be composable and compatible with Radix/shadcn patterns',
    'Must be fully accessible with keyboard navigation',
  ],
  constraints: [
    'TypeScript only',
    'React 18+',
    'No external dependencies beyond React',
    'Must support server-side rendering',
  ],
};

const specFixture: SpecOutput = {
  componentName: 'Button',
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost'",
      required: false,
      default: "'primary'",
      description: 'Visual style variant of the button',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      required: false,
      default: "'md'",
      description: 'Size of the button affecting padding and font size',
    },
    {
      name: 'loading',
      type: 'boolean',
      required: false,
      default: 'false',
      description:
        'When true, shows a loading spinner and disables interaction',
    },
    {
      name: 'leftIcon',
      type: 'React.ReactNode',
      required: false,
      description: 'Icon element rendered before the button label',
    },
    {
      name: 'rightIcon',
      type: 'React.ReactNode',
      required: false,
      description: 'Icon element rendered after the button label',
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Whether the button is disabled',
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      required: true,
      description: 'Button label content',
    },
    {
      name: 'asChild',
      type: 'boolean',
      required: false,
      default: 'false',
      description:
        'When true, merges props onto the child element instead of rendering a <button>',
    },
  ],
  variants: [
    { name: 'variant', values: ['primary', 'secondary', 'ghost'] },
    { name: 'size', values: ['sm', 'md', 'lg'] },
  ],
  accessibility: {
    role: 'button',
    ariaAttributes: [
      'aria-disabled when loading or disabled',
      'aria-busy when loading',
      'aria-label supported for icon-only buttons',
    ],
    keyboardInteractions: [
      { key: 'Enter', action: 'Activates the button' },
      { key: 'Space', action: 'Activates the button' },
      { key: 'Tab', action: 'Moves focus to/from the button' },
    ],
  },
  themingNotes:
    'Uses CSS custom properties (--button-*) for colours, spacing, and typography. Each variant maps to a set of custom property overrides via data-variant attribute.',
  acceptanceCriteria: [
    'Renders as a <button> element by default',
    'Applies correct styles for each variant',
    'Applies correct padding/font-size for each size',
    'Shows loading spinner and sets aria-busy when loading=true',
    'Disables click handler when loading or disabled',
    'Renders leftIcon before children and rightIcon after children',
    'Forwards ref to the underlying button element',
    'Supports asChild pattern for custom element rendering',
    'Is keyboard accessible (Enter and Space activate)',
    'Passes automated a11y checks (axe-core)',
  ],
};

const implementFixture: ImplementOutput = {
  files: [
    {
      path: 'components/Button/Button.types.ts',
      content: `import type { ComponentPropsWithRef, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size affecting padding and font size */
  size?: ButtonSize;
  /** Shows loading spinner and disables interaction */
  loading?: boolean;
  /** Icon rendered before the label */
  leftIcon?: ReactNode;
  /** Icon rendered after the label */
  rightIcon?: ReactNode;
  /** Merges props onto child element instead of rendering a <button> */
  asChild?: boolean;
}
`,
    },
    {
      path: 'components/Button/Button.tsx',
      content: `import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';

const sizeClasses: Record<string, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

const variantClasses: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      asChild = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const classes = [
      'btn',
      variantClasses[variant],
      sizeClasses[size],
      loading ? 'btn-loading' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        data-variant={variant}
        data-size={size}
        {...rest}
      >
        {loading && <span className="btn-spinner" aria-hidden="true" />}
        {leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
        <span className="btn-label">{children}</span>
        {rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
      </button>
    );
  },
);
`,
    },
    {
      path: 'components/Button/Button.test.tsx',
      content: `import { describe, it, expect } from 'vitest';

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
`,
    },
    {
      path: 'components/Button/index.ts',
      content: `export { Button } from './Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from './Button.types';
`,
    },
    {
      path: 'components/Button/README.md',
      content: `# Button

A composable Button component with variants, sizes, loading state, and icon support.

## Usage

\`\`\`tsx
import { Button } from './components/Button';

// Primary button (default)
<Button>Click me</Button>

// Secondary with icons
<Button variant="secondary" leftIcon={<IconPlus />}>
  Add item
</Button>

// Ghost, small, loading
<Button variant="ghost" size="sm" loading>
  Saving...
</Button>

// Large with right icon
<Button size="lg" rightIcon={<IconArrow />}>
  Continue
</Button>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \\| 'secondary' \\| 'ghost' | 'primary' | Visual style |
| size | 'sm' \\| 'md' \\| 'lg' | 'md' | Button size |
| loading | boolean | false | Show spinner, disable interaction |
| leftIcon | ReactNode | — | Icon before label |
| rightIcon | ReactNode | — | Icon after label |
| asChild | boolean | false | Merge onto child element |

## Accessibility

- Uses native \`<button>\` element
- Sets \`aria-disabled\` and \`aria-busy\` appropriately
- Keyboard: Enter and Space activate the button
- Supports \`aria-label\` for icon-only usage
`,
    },
  ],
  notes:
    'Component uses forwardRef for ref forwarding. The asChild prop is declared but not yet fully implemented — a Slot utility (like Radix Slot) would be needed for full composability.',
};

const reviewFixture: ReviewOutput = {
  approved: true,
  a11yChecklist: [
    { item: 'Uses semantic <button> element', passed: true },
    { item: 'Sets aria-disabled when disabled/loading', passed: true },
    { item: 'Sets aria-busy during loading state', passed: true },
    { item: 'Keyboard accessible (Enter + Space)', passed: true },
    { item: 'Supports aria-label for icon-only buttons', passed: true },
    { item: 'Loading spinner hidden from screen readers', passed: true },
  ],
  feedback: [
    'Component API is clean and follows common React patterns',
    'forwardRef correctly applied',
    'Types are well-separated into their own file',
    'The asChild pattern is declared but noted as not fully implemented — acceptable for initial delivery',
  ],
  suggestions: [
    'Consider adding a Slot component for full asChild support',
    'Add visual regression tests with Storybook',
    'Consider CSS modules or a CSS-in-JS solution for style encapsulation',
  ],
};

const deliverFixture: DeliverOutput = {
  summary:
    'Successfully generated a composable Button component with primary/secondary/ghost variants, sm/md/lg sizes, loading state with spinner, and left/right icon slots. The component uses forwardRef, is keyboard accessible, and follows Radix/shadcn API patterns.',
  filesWritten: [
    'components/Button/Button.tsx',
    'components/Button/Button.types.ts',
    'components/Button/Button.test.tsx',
    'components/Button/index.ts',
    'components/Button/README.md',
  ],
  nextSteps: [
    'Add Storybook stories for visual documentation',
    'Implement full asChild pattern using a Slot utility',
    'Add visual regression tests',
    'Set up a documentation site with live examples',
    'Add CSS custom property theming support',
    'Add component to a design system package',
  ],
};

// ---------------------------------------------------------------------------
// Fixture registry
// ---------------------------------------------------------------------------

const fixtures: Record<string, unknown> = {
  intake: intakeFixture,
  spec: specFixture,
  implement: implementFixture,
  review: reviewFixture,
  deliver: deliverFixture,
};

// ---------------------------------------------------------------------------
// Fake LLM provider
// ---------------------------------------------------------------------------

export class FakeLlmProvider implements LlmProvider {
  async generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T> {
    // Extract state hint from prompt
    const stateMatch = prompt.match(/\[STATE:\s*(\w+)\]/);
    if (!stateMatch) {
      throw new Error('FakeLlmProvider: no [STATE: ...] hint found in prompt');
    }

    const stateName = stateMatch[1];
    const fixture = fixtures[stateName];
    if (!fixture) {
      throw new Error(
        `FakeLlmProvider: no fixture for state "${stateName}"`,
      );
    }

    // Validate fixture against schema (catches fixture bugs at dev time)
    const parsed = schema.parse(fixture);
    return parsed;
  }
}
