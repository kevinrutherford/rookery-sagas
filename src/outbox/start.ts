import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import * as E from 'fp-ts/Either'
import { domainEvent } from './domain-event'
import { Logger } from '../logger'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const propagate = (logger: Logger) => (event: unknown): void => {
  const e = domainEvent.decode(event)
  if (E.isLeft(e))
    return
  logger.debug('Event received', { type: e.right.type })
}

export const start = (logger: Logger): void => {
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })

  subscription.on('data', (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    propagate(logger)(event)
  })
}

