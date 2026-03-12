import { resolve } from 'node:path';
import { FakeLlmProvider } from './llm/fake.js';
import { loadSkill } from './orchestrator/skillLoader.js';
import { runOrchestrator } from './orchestrator/orchestrator.js';

const DEFAULT_INPUT =
  'Generate a composable Button component with variants (primary, secondary, ghost), sizes (sm, md, lg), loading state, and optional left/right icons. Use an API compatible with Radix/shadcn composability patterns.';

function generateRunId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const hex = (now.getTime() & 0xffff).toString(16).padStart(4, '0');
  return `${date}-${time}-${hex}`;
}

function parseArgs(argv: string[]): { skill: string; input: string } {
  let skill = 'react_component_delivery';
  let input = DEFAULT_INPUT;

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--skill' && argv[i + 1]) {
      skill = argv[++i];
    } else if (argv[i] === '--input' && argv[i + 1]) {
      input = argv[++i];
    }
  }

  return { skill, input };
}

async function main(): Promise<void> {
  const { skill: skillName, input } = parseArgs(process.argv);
  const runId = generateRunId();

  const projectRoot = resolve(import.meta.dirname, '..');
  const skillDir = resolve(projectRoot, 'ai', 'skills', skillName);
  const artifactsDir = resolve(projectRoot, 'artifacts');
  const outputDir = resolve(projectRoot, 'output');

  console.log(`[orchestrator] Run ID: ${runId}`);
  console.log(`[orchestrator] Loading skill: ${skillName}`);

  const skill = await loadSkill(skillDir);
  console.log(
    `[orchestrator] Loaded skill: ${skill.meta.name} (${skill.meta.states.length} states)`,
  );

  const llm = new FakeLlmProvider();

  const result = await runOrchestrator({
    skill,
    llm,
    runId,
    input,
    artifactsDir,
    outputDir,
  });

  console.log('');
  console.log(
    `[orchestrator] Done. ${result.statesCompleted.length}/${skill.meta.states.length} states completed.`,
  );
  console.log(`[orchestrator] Artefacts: ${result.artefactPaths.join(', ')}`);
  if (result.outputPaths.length > 0) {
    console.log(`[orchestrator] Output files: ${result.outputPaths.join(', ')}`);
  }
}

main().catch((err) => {
  console.error('[orchestrator] Fatal error:', err);
  process.exit(1);
});
