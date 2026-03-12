import type { Transition } from './schemas.js';

export type StateEvent = 'SUCCESS' | 'BLOCKED';

const TERMINAL_STATE = 'DONE';

export class MaxRetriesExceededError extends Error {
  constructor(state: string, maxRetries: number) {
    super(`State "${state}" exceeded maximum retries (${maxRetries})`);
    this.name = 'MaxRetriesExceededError';
  }
}

export class InvalidTransitionError extends Error {
  constructor(state: string, event: StateEvent) {
    super(`No transition from state "${state}" on event "${event}"`);
    this.name = 'InvalidTransitionError';
  }
}

export class StateMachine {
  private currentState: string;
  private readonly transitions: Transition[];
  private readonly retryCounts = new Map<string, number>();
  private readonly maxRetries: number;

  constructor(
    transitions: Transition[],
    initialState: string,
    maxRetries = 2,
  ) {
    this.transitions = transitions;
    this.currentState = initialState;
    this.maxRetries = maxRetries;
  }

  get state(): string {
    return this.currentState;
  }

  isTerminal(): boolean {
    return this.currentState === TERMINAL_STATE;
  }

  advance(event: StateEvent): string {
    const transition = this.transitions.find(
      (t) => t.from === this.currentState && t.event === event,
    );

    if (!transition) {
      throw new InvalidTransitionError(this.currentState, event);
    }

    if (event === 'BLOCKED') {
      const count = (this.retryCounts.get(this.currentState) ?? 0) + 1;
      if (count > this.maxRetries) {
        throw new MaxRetriesExceededError(this.currentState, this.maxRetries);
      }
      this.retryCounts.set(this.currentState, count);
    }

    this.currentState = transition.to;
    return this.currentState;
  }
}
