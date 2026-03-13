import { resolve } from 'node:path';
import { FakeLlmProvider } from './llm/fake.js';
import { AnthropicProvider } from './llm/anthropic.js';
import type { LlmProvider } from './llm/llm.js';
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

interface CliArgs {
  skill: string;
  input: string;
  provider: 'fake' | 'anthropic';
  model?: string;
}

function parseArgs(argv: string[]): CliArgs {
  let skill = 'react_component_delivery';
  let input = DEFAULT_INPUT;
  let provider: 'fake' | 'anthropic' = 'fake';
  let model: string | undefined;

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--skill' && argv[i + 1]) {
      skill = argv[++i];
    } else if (argv[i] === '--input' && argv[i + 1]) {
      input = argv[++i];
    } else if (argv[i] === '--provider' && argv[i + 1]) {
      provider = argv[++i] as 'fake' | 'anthropic';
    } else if (argv[i] === '--model' && argv[i + 1]) {
      model = argv[++i];
    }
  }

  return { skill, input, provider, model };
}

function createLlm(args: CliArgs): LlmProvider {
  switch (args.provider) {
    case 'anthropic':
      return new AnthropicProvider({ model: args.model });
    case 'fake':
    default:
      return new FakeLlmProvider();
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const runId = generateRunId();

  const projectRoot = resolve(import.meta.dirname, '..');
  const skillDir = resolve(projectRoot, 'ai', 'skills', args.skill);
  const artifactsDir = resolve(projectRoot, 'artifacts');
  const outputDir = resolve(projectRoot, 'output');

  console.log(`[orchestrator] Run ID: ${runId}`);
  console.log(`[orchestrator] Loading skill: ${args.skill}`);
  console.log(`[orchestrator] Provider: ${args.provider}`);

  const skill = await loadSkill(skillDir);
  console.log(
    `[orchestrator] Loaded skill: ${skill.meta.name} (${skill.meta.states.length} states)`,
  );

  const llm = createLlm(args);

  const result = await runOrchestrator({
    skill,
    llm,
    runId,
    input: args.input,
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
