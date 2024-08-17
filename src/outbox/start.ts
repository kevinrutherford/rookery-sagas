import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import * as E from 'fp-ts/Either'
import { DomainEvent, domainEvent } from './domain-event'
import { Logger } from '../logger'

const followedActors = [
  process.env.USER_A1_ID ?? 'not-a-user',
  process.env.USER_A2_ID ?? 'not-a-user',
  process.env.USER_A3_ID ?? 'not-a-user',
]

const isShareable = (event: DomainEvent): boolean => followedActors.includes(event.data.actorId)

const propagate = (logger: Logger) => (esEvent: unknown): void => {
  const e = domainEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  logger.debug('Event received', { type: event.type })
  if (!isShareable(event))
    return
  logger.debug('Shareable event received', { type: event.type })
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

