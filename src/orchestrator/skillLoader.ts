import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseFrontmatter } from '../utils/frontmatter.js';
import {
  AgentFrontmatterSchema,
  SkillFrontmatterSchema,
  type AgentFrontmatter,
  type SkillFrontmatter,
  type Transition,
} from './schemas.js';

export interface AgentContract {
  frontmatter: AgentFrontmatter;
  body: string;
}

export interface SkillDefinition {
  meta: SkillFrontmatter;
  body: string;
  agents: Map<string, AgentContract>;
  transitions: Transition[];
  initialState: string;
}

/**
 * Loads a skill from a directory containing SKILL.md and state subdirectories
 * with AGENTS.md files.
 */
export async function loadSkill(skillDir: string): Promise<SkillDefinition> {
  // Read and parse SKILL.md
  const skillRaw = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
  const { data: skillData, body: skillBody } = parseFrontmatter(skillRaw);
  const meta = SkillFrontmatterSchema.parse(skillData);

  if (meta.states.length === 0) {
    throw new Error('SKILL.md must define at least one state');
  }

  // Load each agent's AGENTS.md
  const agents = new Map<string, AgentContract>();

  for (const state of meta.states) {
    const agentPath = join(skillDir, state.agentPath);
    const agentRaw = await readFile(agentPath, 'utf-8');
    const { data: agentData, body: agentBody } = parseFrontmatter(agentRaw);
    const frontmatter = AgentFrontmatterSchema.parse(agentData);

    agents.set(state.name, { frontmatter, body: agentBody });
  }

  return {
    meta,
    body: skillBody,
    agents,
    transitions: meta.transitions,
    initialState: meta.states[0].name,
  };
}
