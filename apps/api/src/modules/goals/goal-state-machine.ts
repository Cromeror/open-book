import { GoalStatus } from '../../entities/goal.entity';

/**
 * Configuration for a state transition
 */
export interface TransitionConfig {
  /** Target states this state can transition to */
  allowedTransitions: GoalStatus[];
  /** Whether justification is required when transitioning TO this state */
  requiresJustification: boolean;
  /** Whether this is a terminal state (no outgoing transitions) */
  isTerminal: boolean;
}

/**
 * State Machine configuration for Goal states
 *
 * Transition diagram:
 * ```
 * ACTIVE
 *   -> PAUSED (requires justification)
 *   -> COMPLETED
 *   -> CANCELLED (requires justification)
 *
 * PAUSED
 *   -> ACTIVE
 *   -> CANCELLED (requires justification)
 *
 * COMPLETED
 *   -> (terminal, no transitions)
 *
 * CANCELLED
 *   -> (terminal, no transitions)
 * ```
 */
export const GOAL_STATE_CONFIG: Record<GoalStatus, TransitionConfig> = {
  [GoalStatus.ACTIVE]: {
    allowedTransitions: [
      GoalStatus.PAUSED,
      GoalStatus.COMPLETED,
      GoalStatus.CANCELLED,
    ],
    requiresJustification: false, // No justification to become ACTIVE
    isTerminal: false,
  },
  [GoalStatus.PAUSED]: {
    allowedTransitions: [GoalStatus.ACTIVE, GoalStatus.CANCELLED],
    requiresJustification: true, // Justification required to pause
    isTerminal: false,
  },
  [GoalStatus.COMPLETED]: {
    allowedTransitions: [],
    requiresJustification: false, // Can complete without justification
    isTerminal: true,
  },
  [GoalStatus.CANCELLED]: {
    allowedTransitions: [],
    requiresJustification: true, // Justification required to cancel
    isTerminal: true,
  },
};

/**
 * Result of a transition validation
 */
export interface TransitionResult {
  isValid: boolean;
  error?: string;
  requiresJustification: boolean;
}

/**
 * Validates if a state transition is allowed
 *
 * @param from - Current state
 * @param to - Target state
 * @returns TransitionResult with validation details
 */
export function canTransition(
  from: GoalStatus,
  to: GoalStatus,
): TransitionResult {
  const fromConfig = GOAL_STATE_CONFIG[from];
  const toConfig = GOAL_STATE_CONFIG[to];

  // Check if it's the same state
  if (from === to) {
    return {
      isValid: false,
      error: 'The goal is already in this state',
      requiresJustification: false,
    };
  }

  // Check if from state is terminal
  if (fromConfig.isTerminal) {
    return {
      isValid: false,
      error: `Cannot change state of a ${from.toLowerCase()} goal`,
      requiresJustification: false,
    };
  }

  // Check if transition is allowed
  if (!fromConfig.allowedTransitions.includes(to)) {
    return {
      isValid: false,
      error: `Transition not allowed from ${from} to ${to}`,
      requiresJustification: false,
    };
  }

  return {
    isValid: true,
    requiresJustification: toConfig.requiresJustification,
  };
}

/**
 * Check if a state is terminal (no outgoing transitions)
 */
export function isTerminalState(status: GoalStatus): boolean {
  return GOAL_STATE_CONFIG[status].isTerminal;
}

/**
 * Check if justification is required to transition to a state
 */
export function requiresJustification(status: GoalStatus): boolean {
  return GOAL_STATE_CONFIG[status].requiresJustification;
}

/**
 * Get all possible next states from a given state
 */
export function getNextStates(status: GoalStatus): GoalStatus[] {
  return GOAL_STATE_CONFIG[status].allowedTransitions;
}

/**
 * Utility class for state machine operations
 */
export class GoalStateMachine {
  /**
   * Validate a transition and throw if invalid
   * @throws Error if transition is not allowed
   */
  static validateTransition(
    from: GoalStatus,
    to: GoalStatus,
    justification?: string,
  ): void {
    const result = canTransition(from, to);

    if (!result.isValid) {
      throw new Error(result.error);
    }

    if (result.requiresJustification && !justification) {
      throw new Error(
        `Justification is required when changing to ${to} status`,
      );
    }
  }

  /**
   * Check if a goal in a given state can be modified
   */
  static canModify(status: GoalStatus): boolean {
    return !isTerminalState(status);
  }

  /**
   * Get human-readable state description
   */
  static getStateDescription(status: GoalStatus): string {
    const descriptions: Record<GoalStatus, string> = {
      [GoalStatus.ACTIVE]: 'The goal is active and receiving contributions',
      [GoalStatus.PAUSED]:
        'The goal is temporarily paused and not receiving contributions',
      [GoalStatus.COMPLETED]:
        'The goal has been successfully completed',
      [GoalStatus.CANCELLED]: 'The goal was cancelled and will not continue',
    };
    return descriptions[status];
  }
}
