---
{
  "name": "react_component_delivery",
  "goal": "Generate a production-ready React component from a natural language description, including types, tests, and documentation",
  "inputs": ["userPrompt"],
  "outputs": ["componentFiles", "deliverySummary"],
  "constraints": [
    "TypeScript only",
    "React 18+",
    "Accessible (WCAG 2.1 AA)",
    "Composable API (forwardRef, slot patterns)",
    "No external runtime dependencies beyond React"
  ],
  "states": [
    { "name": "intake", "agentPath": "intake/AGENTS.md", "artefact": "intake.json" },
    { "name": "spec", "agentPath": "spec/AGENTS.md", "artefact": "spec.json" },
    { "name": "implement", "agentPath": "implement/AGENTS.md", "artefact": "implement.json" },
    { "name": "review", "agentPath": "review/AGENTS.md", "artefact": "review.json" },
    { "name": "deliver", "agentPath": "deliver/AGENTS.md", "artefact": "deliver.json" }
  ],
  "transitions": [
    { "from": "intake", "event": "SUCCESS", "to": "spec" },
    { "from": "spec", "event": "SUCCESS", "to": "implement" },
    { "from": "implement", "event": "SUCCESS", "to": "review" },
    { "from": "review", "event": "SUCCESS", "to": "deliver" },
    { "from": "review", "event": "BLOCKED", "to": "implement" },
    { "from": "deliver", "event": "SUCCESS", "to": "DONE" }
  ]
}
---

# React Component Delivery

This skill generates a complete React component from a user's natural language description.

## Flow

```
INTAKE → SPEC → IMPLEMENT → REVIEW → DELIVER
                    ↑           |
                    └── BLOCKED ┘
```

## States

1. **INTAKE** — Parse the user's request into structured requirements
2. **SPEC** — Produce a detailed component specification (props, variants, a11y, acceptance criteria)
3. **IMPLEMENT** — Generate all source files (component, types, tests, exports, docs)
4. **REVIEW** — Audit the implementation against the spec and accessibility standards
5. **DELIVER** — Produce a summary and next-steps list

If REVIEW returns BLOCKED, the orchestrator loops back to IMPLEMENT with feedback.

## Orchestrator Contract

The orchestrator is a coordinator only. It does not generate component code, write specs, or review directly. Each state is handled by its sub-agent as defined in the corresponding AGENTS.md.
