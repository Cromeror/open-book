export {
  createGoalSchema,
  CreateGoalDto,
  CreateGoalInput,
  validateCreateGoalDto,
} from './create-goal.dto';

export {
  updateGoalSchema,
  UpdateGoalDto,
  UpdateGoalInput,
  validateUpdateGoalDto,
} from './update-goal.dto';

export {
  changeStatusSchema,
  ChangeStatusDto,
  ChangeStatusInput,
  validateChangeStatusDto,
} from './change-status.dto';

export {
  queryGoalsSchema,
  QueryGoalsDto,
  validateQueryGoalsDto,
  PaginationMeta,
  PaginatedResponse,
} from './query-goals.dto';
