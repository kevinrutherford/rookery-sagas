import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import { sequenceS } from 'fp-ts/Apply'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/function'
import { inboxCommentCreatedEvent, InboxCommentCreatedEvent } from './domain-event'
import { Api } from '../api'
import { Logger } from '../logger'

const isDiscussionCachedLocallyAlready = (api: Api) => (id: string): T.Task<boolean> => pipe(
  id,
  api.fetchDiscussion,
  TE.match(() => false, () => true),
)

const isMemberCachedLocallyAlready = (api: Api) => (id: string): T.Task<boolean> => pipe(
  id,
  api.fetchMember,
  TE.match(() => false, () => true),
)

const fetchAndCacheActor = (api: Api, event: InboxCommentCreatedEvent) => pipe(
  event.data.actorId,
  isMemberCachedLocallyAlready(api),
  TE.rightTask,
  TE.chain(B.match(
    () => pipe(
      event.data.actorId,
      api.fetchRemoteMember,
      TE.chainW(api.cacheMember),
    ),
    () => TE.right(null),
  )),
)

const fetchAndCacheDiscussion = (api: Api, event: InboxCommentCreatedEvent) => pipe(
  event.data.discussionId,
  isDiscussionCachedLocallyAlready(api),
  TE.rightTask,
  TE.chain(B.match(
    () => pipe(
      event.data.discussionId,
      api.fetchRemoteDiscussion,
      TE.chainW(api.cacheDiscussion),
    ),
    () => TE.right(null),
  )),
)

const propagate = (logger: Logger, api: Api) => async (esEvent: unknown): Promise<void> => {
  const e = inboxCommentCreatedEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  logger.debug('Inbox: Event received', { type: event.type })
  if (event.type === 'inbox:comment-created') {
    await pipe(
      {
        actor: fetchAndCacheActor(api, event),
        discussion: fetchAndCacheDiscussion(api, event),
      },
      sequenceS(TE.ApplyPar),
      TE.mapLeft((errors) => {
        logger.error('Failed to deal with inbox comment', { errors: JSON.stringify(errors) })
      }),
    )()
  }
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

