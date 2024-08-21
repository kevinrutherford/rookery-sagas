import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { inboxCommentCreatedEvent, InboxCommentCreatedEvent } from './domain-event'
import { Api } from '../api'
import { Logger } from '../logger'

const ensureLocalMemberNotCachedAlready = (api: Api) => (id: string): TE.TaskEither<unknown, string> => pipe(
  id,
  api.fetchMember,
  TE.match(
    () => E.right(id),
    () => E.left(''),
  ),
)

const fetchActor = async (api: Api, event: InboxCommentCreatedEvent) => {
  await pipe(
    event.data.actorId,
    ensureLocalMemberNotCachedAlready(api),
    TE.chainW(api.fetchRemoteMember),
    TE.chainW(api.cacheMember),
  )()
}

const propagate = (logger: Logger, api: Api) => (esEvent: unknown): void => {
  const e = inboxCommentCreatedEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  logger.debug('Inbox: Event received', { type: event.type })
  if (event.type === 'inbox:comment-created')
    fetchActor(api, event)
}

export const start = (logger: Logger, api: Api): void => {
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })

  subscription.on('data', (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    propagate(logger, api)(event)
  })
}

