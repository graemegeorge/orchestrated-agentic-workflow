import { z } from 'zod';

// ---------------------------------------------------------------------------
// SKILL.md frontmatter
// ---------------------------------------------------------------------------

export const StateDefinitionSchema = z.object({
  name: z.string(),
  agentPath: z.string(),
  artefact: z.string(),
});

export const TransitionSchema = z.object({
  from: z.string(),
  event: z.enum(['SUCCESS', 'BLOCKED']),
  to: z.string(),
});

export const SkillFrontmatterSchema = z.object({
  name: z.string(),
  goal: z.string(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  constraints: z.array(z.string()),
  states: z.array(StateDefinitionSchema),
  transitions: z.array(TransitionSchema),
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
export type StateDefinition = z.infer<typeof StateDefinitionSchema>;
export type Transition = z.infer<typeof TransitionSchema>;

// ---------------------------------------------------------------------------
// AGENTS.md frontmatter
// ---------------------------------------------------------------------------

export const AgentFrontmatterSchema = z.object({
  purpose: z.string(),
  inputArtefacts: z.array(z.string()),
  outputArtefact: z.string(),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;

// ---------------------------------------------------------------------------
// State output schemas
// ---------------------------------------------------------------------------

export const IntakeOutputSchema = z.object({
  componentName: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
  constraints: z.array(z.string()),
});

export type IntakeOutput = z.infer<typeof IntakeOutputSchema>;

export const PropDefinitionSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  default: z.string().optional(),
  description: z.string(),
});

export const SpecOutputSchema = z.object({
  componentName: z.string(),
  props: z.array(PropDefinitionSchema),
  variants: z.array(
    z.object({
      name: z.string(),
      values: z.array(z.string()),
    }),
  ),
  accessibility: z.object({
    role: z.string(),
    ariaAttributes: z.array(z.string()),
    keyboardInteractions: z.array(
      z.object({
        key: z.string(),
        action: z.string(),
      }),
    ),
  }),
  themingNotes: z.string(),
  acceptanceCriteria: z.array(z.string()),
});

export type SpecOutput = z.infer<typeof SpecOutputSchema>;

export const FileEntrySchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const ImplementOutputSchema = z.object({
  files: z.array(FileEntrySchema).min(1),
  notes: z.string().optional(),
});

export type ImplementOutput = z.infer<typeof ImplementOutputSchema>;

export const ReviewOutputSchema = z.object({
  approved: z.boolean(),
  a11yChecklist: z.array(
    z.object({
      item: z.string(),
      passed: z.boolean(),
    }),
  ),
  feedback: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type ReviewOutput = z.infer<typeof ReviewOutputSchema>;

export const DeliverOutputSchema = z.object({
  summary: z.string(),
  filesWritten: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export type DeliverOutput = z.infer<typeof DeliverOutputSchema>;

// ---------------------------------------------------------------------------
// Schema registry — maps artefact filenames to their Zod schemas
// ---------------------------------------------------------------------------

export const schemaRegistry: Record<string, z.ZodSchema> = {
  'intake.json': IntakeOutputSchema,
  'spec.json': SpecOutputSchema,
  'implement.json': ImplementOutputSchema,
  'review.json': ReviewOutputSchema,
  'deliver.json': DeliverOutputSchema,
};
