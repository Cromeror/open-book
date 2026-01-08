// Module
export { GoalsModule } from './goals.module';

// Service
export { GoalsService, AuditContext } from './goals.service';

// Controller
export { GoalsController } from './goals.controller';

// State Machine
export {
  GOAL_STATE_CONFIG,
  TransitionConfig,
  TransitionResult,
  canTransition,
  isTerminalState,
  requiresJustification,
  getNextStates,
  GoalStateMachine,
} from './goal-state-machine';

// DTOs
export {
  CreateGoalDto,
  validateCreateGoalDto,
  UpdateGoalDto,
  validateUpdateGoalDto,
  ChangeStatusDto,
  validateChangeStatusDto,
  QueryGoalsDto,
  validateQueryGoalsDto,
  PaginationMeta,
  PaginatedResponse,
} from './dto';
