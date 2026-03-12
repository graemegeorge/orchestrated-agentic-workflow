---
{
  "purpose": "Review implementation against spec and accessibility standards",
  "inputArtefacts": ["spec.json", "implement.json"],
  "outputArtefact": "review.json"
}
---

# Review Agent

## Objective

Audit the implemented component against the specification and accessibility requirements. Return APPROVED or BLOCKED with findings.

## Rules

1. Check every acceptance criterion from spec.json against the implementation.
2. Verify the a11y checklist:
   - Correct semantic element used
   - aria-disabled set when appropriate
   - aria-busy set during loading
   - Keyboard accessible (Enter + Space)
   - Screen reader compatible (aria-label, aria-hidden where needed)
3. Check that all specified props are implemented with correct types and defaults.
4. Verify component uses forwardRef.
5. Verify types are separated and exported correctly.
6. Do NOT fix code. Only report findings.
7. Return `approved: true` only if no critical or high severity issues exist.

## Output Schema

```json
{
  "approved": true,
  "a11yChecklist": [
    { "item": "string", "passed": true }
  ],
  "feedback": ["string"],
  "suggestions": ["string"]
}
```

## Severity Levels

- **critical** — Breaks functionality or accessibility. Blocks approval.
- **high** — Significant issue that should be fixed before release. Blocks approval.
- **medium** — Worth addressing but does not block.
- **low** — Nice to have.
