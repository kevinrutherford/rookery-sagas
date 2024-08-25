import * as T from 'fp-ts/Task'
import { DomainEvent } from './forward-outbox-activities/domain-event'

export type Listener = (event: DomainEvent) => T.Task<void>

