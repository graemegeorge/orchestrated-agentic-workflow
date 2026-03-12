import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import type { ZodSchema } from 'zod';
import type { LlmProvider } from '../llm/llm.js';
import {
  writeArtefact,
  writeCodeFile,
  writeMarkdownArtefact,
} from '../utils/fileWriter.js';
import { schemaRegistry } from './schemas.js';
import type { SkillDefinition } from './skillLoader.js';
import { StateMachine } from './stateMachine.js';
import type { ImplementOutput, ReviewOutput } from './schemas.js';

export interface OrchestratorConfig {
  skill: SkillDefinition;
  llm: LlmProvider;
  runId: string;
  input: string;
  artifactsDir: string;
  outputDir: string;
}

export interface RunResult {
  runId: string;
  statesCompleted: string[];
  artefactPaths: string[];
  outputPaths: string[];
}

/**
 * Builds a prompt for a given state, including the agent contract body,
 * user input, and any prior artefacts.
 */
function buildPrompt(
  stateName: string,
  agentBody: string,
  userInput: string,
  priorArtefacts: Record<string, unknown>,
): string {
  const parts: string[] = [
    `[STATE: ${stateName}]`,
    '',
    agentBody,
    '',
    '[CONTEXT]',
    `User input: ${userInput}`,
  ];

  for (const [name, data] of Object.entries(priorArtefacts)) {
    parts.push('');
    parts.push(`Artefact "${name}":`);
    parts.push(JSON.stringify(data, null, 2));
  }

  parts.push('');
  parts.push('[OUTPUT FORMAT]');
  parts.push('Return valid JSON only, matching the required schema.');

  return parts.join('\n');
}

/**
 * Runs the orchestrator through all states of a skill.
 */
export async function runOrchestrator(
  config: OrchestratorConfig,
): Promise<RunResult> {
  const { skill, llm, runId, input, artifactsDir, outputDir } = config;
  const runDir = join(artifactsDir, runId);

  const machine = new StateMachine(skill.transitions, skill.initialState);

  const artefacts = new Map<string, unknown>();
  const statesCompleted: string[] = [];
  const artefactPaths: string[] = [];
  const outputPaths: string[] = [];

  while (!machine.isTerminal()) {
    const stateName = machine.state;
    const stateDefinition = skill.meta.states.find(
      (s) => s.name === stateName,
    );
    if (!stateDefinition) {
      throw new Error(`State "${stateName}" not found in skill definition`);
    }

    const agent = skill.agents.get(stateName);
    if (!agent) {
      throw new Error(`No agent contract found for state "${stateName}"`);
    }

    // Gather prior artefacts needed by this agent
    const priorArtefacts: Record<string, unknown> = {};
    for (const inputArtefact of agent.frontmatter.inputArtefacts) {
      const data = artefacts.get(inputArtefact);
      if (data !== undefined) {
        priorArtefacts[inputArtefact] = data;
      }
    }

    // Build prompt and call LLM
    const prompt = buildPrompt(stateName, agent.body, input, priorArtefacts);
    const schema = schemaRegistry[stateDefinition.artefact] as
      | ZodSchema
      | undefined;
    if (!schema) {
      throw new Error(
        `No schema registered for artefact "${stateDefinition.artefact}"`,
      );
    }

    console.log(`[${stateName}] Processing...`);
    const result = await llm.generate(prompt, schema);

    // Store artefact
    artefacts.set(stateDefinition.artefact, result);

    // Write artefact to disk
    if (stateDefinition.artefact.endsWith('.md')) {
      const path = await writeMarkdownArtefact(
        runDir,
        stateDefinition.artefact,
        (result as { summary: string }).summary,
      );
      artefactPaths.push(path);
    } else {
      const path = await writeArtefact(
        runDir,
        stateDefinition.artefact,
        result,
      );
      artefactPaths.push(path);
    }
    console.log(`[${stateName}] Wrote ${stateDefinition.artefact}`);

    // If implement state, write code files to output directory
    if (stateName === 'implement') {
      const implementResult = result as ImplementOutput;
      for (const file of implementResult.files) {
        const path = await writeCodeFile(outputDir, file.path, file.content);
        outputPaths.push(path);
        console.log(`[${stateName}] Wrote ${file.path}`);
      }
    }

    statesCompleted.push(stateName);

    // Determine event for state machine advancement
    if (stateName === 'review') {
      const reviewResult = result as ReviewOutput;
      const event = reviewResult.approved ? 'SUCCESS' : 'BLOCKED';
      console.log(
        `[${stateName}] Result: ${reviewResult.approved ? 'APPROVED' : 'BLOCKED'}`,
      );
      machine.advance(event);
    } else {
      machine.advance('SUCCESS');
    }
  }

  return { runId, statesCompleted, artefactPaths, outputPaths };
}
