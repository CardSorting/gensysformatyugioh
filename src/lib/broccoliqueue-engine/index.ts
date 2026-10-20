export { BroccoliQueue } from './queue'
export type { JobProcessor } from './queue'
export type {
  AddJob,
  BackoffOptions,
  BroccoliDatabase,
  DashboardHandle,
  DashboardOptions,
  Job,
  JobError,
  JobOptions,
  JobQuery,
  JobState,
  JsonValue,
  QueueOptions,
  QueueHealth,
  QueueStateCounts,
  QueueSummary,
  RetryResult,
  WorkerContext,
  WorkerHandle,
  WorkerOptions
} from './types'

export const states = Object.freeze({
  waiting: 'waiting',
  delayed: 'delayed',
  active: 'active',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled'
})
