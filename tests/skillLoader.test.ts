import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { loadSkill } from '../src/orchestrator/skillLoader.js';

const SKILL_DIR = resolve(
  import.meta.dirname,
  '..',
  'ai',
  'skills',
  'react_component_delivery',
);

describe('skillLoader', () => {
  it('should load the sample skill with 5 states', async () => {
    const skill = await loadSkill(SKILL_DIR);

    expect(skill.meta.name).toBe('react_component_delivery');
    expect(skill.meta.states).toHaveLength(5);
    expect(skill.agents.size).toBe(5);
  });

  it('should parse correct state names', async () => {
    const skill = await loadSkill(SKILL_DIR);
    const stateNames = skill.meta.states.map((s) => s.name);

    expect(stateNames).toEqual([
      'intake',
      'spec',
      'implement',
      'review',
      'deliver',
    ]);
  });

  it('should resolve BLOCKED transition from review to implement', async () => {
    const skill = await loadSkill(SKILL_DIR);
    const blockedTransition = skill.transitions.find(
      (t) => t.from === 'review' && t.event === 'BLOCKED',
    );

    expect(blockedTransition).toBeDefined();
    expect(blockedTransition!.to).toBe('implement');
  });

  it('should load agent contracts with valid frontmatter', async () => {
    const skill = await loadSkill(SKILL_DIR);
    const intakeAgent = skill.agents.get('intake');

    expect(intakeAgent).toBeDefined();
    expect(intakeAgent!.frontmatter.purpose).toContain('Parse');
    expect(intakeAgent!.frontmatter.inputArtefacts).toEqual([]);
    expect(intakeAgent!.frontmatter.outputArtefact).toBe('intake.json');
    expect(intakeAgent!.body).toContain('# Intake Agent');
  });
});
