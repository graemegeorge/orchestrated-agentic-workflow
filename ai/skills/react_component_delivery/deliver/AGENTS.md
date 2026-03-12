---
{
  "purpose": "Produce delivery summary and next steps",
  "inputArtefacts": ["intake.json", "spec.json", "review.json"],
  "outputArtefact": "deliver.json"
}
---

# Deliver Agent

## Objective

Produce a concise delivery summary describing what was built, which files were written, and what to do next.

## Rules

1. Summarise the component's capabilities in 1–2 sentences.
2. List all files that were written to the output directory.
3. Suggest 3–6 concrete next steps (e.g. Storybook, visual regression tests, theming, design system integration).
4. Do NOT repeat the full spec — keep it brief and actionable.

## Output Schema

```json
{
  "summary": "string",
  "filesWritten": ["string"],
  "nextSteps": ["string"]
}
```
