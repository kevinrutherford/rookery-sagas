import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { domainEvent, DomainEvent } from '../sagas/forward-outbox-activities/domain-event'

export type Listener = (event: DomainEvent) => T.Task<void>

export const dispatch = (listener: Listener): void => {
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })
  subscription.on('data', async (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    await pipe(
      event,
      domainEvent.decode,
      TE.fromEither,
      TE.chainTaskK(listener),
    )()
  })
}

