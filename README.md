# Orchestrated Agentic Workflow

A pattern for building agentic workflows via an orchestrator using `SKILL.md` and `AGENTS.md` contracts.

Inspired by [jjenzz/agent-skills](https://github.com/jjenzz/agent-skills).

## Quickstart

```bash
npm install
npm run dev -- --skill react_component_delivery --input "Generate a composable Button component with variants (primary, secondary, ghost), sizes (sm, md, lg), loading state, and optional left/right icons."
```

This runs the orchestrator with a **fake LLM** (no API keys needed) and produces:

- `artifacts/<run-id>/` — JSON artefacts for each state
- `output/components/Button/` — Generated component files

## How It Works

```
INTAKE → SPEC → IMPLEMENT → REVIEW → DELIVER
                    ↑           |
                    └── BLOCKED ┘
```

The orchestrator loads a **skill definition** (`SKILL.md`) which describes a state machine and maps each state to a **sub-agent contract** (`AGENTS.md`). For each state, it:

1. Gathers context (user input + prior artefacts)
2. Constructs a prompt from the agent's contract
3. Calls the LLM with the prompt and a Zod schema
4. Validates the response
5. Writes the artefact to disk
6. Advances the state machine

### SKILL.md Structure

Lives at `ai/skills/<skill-name>/SKILL.md`. Uses JSON frontmatter:

```
---
{
  "name": "react_component_delivery",
  "goal": "Generate a React component from a description",
  "states": [
    { "name": "intake", "agentPath": "intake/AGENTS.md", "artefact": "intake.json" },
    ...
  ],
  "transitions": [
    { "from": "intake", "event": "SUCCESS", "to": "spec" },
    { "from": "review", "event": "BLOCKED", "to": "implement" },
    ...
  ]
}
---

Human-readable description of the skill.
```

### AGENTS.md Structure

Lives at `ai/skills/<skill-name>/<state>/AGENTS.md`. Each defines a sub-agent's contract:

```
---
{
  "purpose": "Parse the user's request",
  "inputArtefacts": [],
  "outputArtefact": "intake.json"
}
---

# Agent Name

## Objective
What this agent does.

## Rules
1. Specific instructions...

## Output Schema
{ ... }
```

The orchestrator passes the markdown body to the LLM as instructions — it does not interpret the rules itself.

## Project Structure

```
src/
  cli.ts                    CLI entry point
  llm/
    llm.ts                  LLM provider interface
    fake.ts                 Offline fake LLM with fixtures
  orchestrator/
    orchestrator.ts         Main orchestration loop
    stateMachine.ts         Data-driven state machine
    skillLoader.ts          Loads SKILL.md and AGENTS.md
    schemas.ts              Zod schemas for all artefacts
  utils/
    frontmatter.ts          JSON frontmatter parser
    fileWriter.ts           File writing utilities
ai/skills/
  react_component_delivery/ Sample skill definition
tests/                      Unit tests
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run the CLI with tsx |
| `npm run build` | Compile TypeScript |
| `npm test` | Run tests with vitest |
| `npm run lint` | Type-check with tsc --noEmit |

## Swapping in a Real LLM

Implement the `LlmProvider` interface from `src/llm/llm.ts`:

```typescript
interface LlmProvider {
  generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;
}
```

The `schema` parameter enables structured output / JSON mode with providers that support it.
