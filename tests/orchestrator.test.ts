import { describe, it, expect, beforeEach } from 'vitest';
import { resolve } from 'node:path';
import { rm, readFile, stat } from 'node:fs/promises';
import { loadSkill } from '../src/orchestrator/skillLoader.js';
import { runOrchestrator } from '../src/orchestrator/orchestrator.js';
import { FakeLlmProvider } from '../src/llm/fake.js';

const SKILL_DIR = resolve(
  import.meta.dirname,
  '..',
  'ai',
  'skills',
  'react_component_delivery',
);

const TEST_ARTIFACTS_DIR = resolve(import.meta.dirname, '..', '.test-artifacts');
const TEST_OUTPUT_DIR = resolve(import.meta.dirname, '..', '.test-output');
const TEST_RUN_ID = 'test-run-001';

describe('orchestrator', () => {
  beforeEach(async () => {
    // Clean up test directories
    await rm(TEST_ARTIFACTS_DIR, { recursive: true, force: true });
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  it('should complete all 5 states and write artefacts', async () => {
    const skill = await loadSkill(SKILL_DIR);
    const llm = new FakeLlmProvider();

    const result = await runOrchestrator({
      skill,
      llm,
      runId: TEST_RUN_ID,
      input: 'Generate a Button component',
      artifactsDir: TEST_ARTIFACTS_DIR,
      outputDir: TEST_OUTPUT_DIR,
    });

    expect(result.statesCompleted).toEqual([
      'intake',
      'spec',
      'implement',
      'review',
      'deliver',
    ]);
    expect(result.artefactPaths).toHaveLength(5);
  });

  it('should write valid JSON artefacts to disk', async () => {
    const skill = await loadSkill(SKILL_DIR);
    const llm = new FakeLlmProvider();

    await runOrchestrator({
      skill,
      llm,
      runId: TEST_RUN_ID,
      input: 'Generate a Button component',
      artifactsDir: TEST_ARTIFACTS_DIR,
      outputDir: TEST_OUTPUT_DIR,
    });

    const runDir = resolve(TEST_ARTIFACTS_DIR, TEST_RUN_ID);

    // Verify each artefact is valid JSON
    for (const file of ['intake.json', 'spec.json', 'implement.json', 'review.json', 'deliver.json']) {
      const content = await readFile(resolve(runDir, file), 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    }

    // Verify review is approved
    const review = JSON.parse(
      await readFile(resolve(runDir, 'review.json'), 'utf-8'),
    );
    expect(review.approved).toBe(true);
  });

  it('should write component files to the output directory', async () => {
    const skill = await loadSkill(SKILL_DIR);
    const llm = new FakeLlmProvider();

    const result = await runOrchestrator({
      skill,
      llm,
      runId: TEST_RUN_ID,
      input: 'Generate a Button component',
      artifactsDir: TEST_ARTIFACTS_DIR,
      outputDir: TEST_OUTPUT_DIR,
    });

    expect(result.outputPaths.length).toBeGreaterThan(0);

    // Check key files exist
    const buttonDir = resolve(TEST_OUTPUT_DIR, 'components', 'Button');
    await expect(stat(resolve(buttonDir, 'Button.tsx'))).resolves.toBeDefined();
    await expect(stat(resolve(buttonDir, 'index.ts'))).resolves.toBeDefined();
    await expect(stat(resolve(buttonDir, 'Button.types.ts'))).resolves.toBeDefined();
  });
});
