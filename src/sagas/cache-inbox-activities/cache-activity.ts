import { sequenceS } from 'fp-ts/Apply'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/function'
import { Api } from '../../api'
import { Logger } from '../../logger'
import { InboxCommentCreatedEvent } from '../domain-event'
import { Listener } from '../listener'

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

export const cacheActivity = (logger: Logger, api: Api): Listener => (event) => {
  if (event.type === 'inbox:comment-created') {
    logger.debug('Inbox: Event received', { type: event.type })
    return pipe(
      {
        actor: fetchAndCacheActor(api, event),
        discussion: fetchAndCacheDiscussion(api, event),
      },
      sequenceS(TE.ApplyPar),
      TE.mapLeft((errors) => {
        logger.error('Failed to deal with inbox comment', { errors: JSON.stringify(errors) })
      }),
      TE.toUnion,
      T.map(() => { }), // SMELL -- must be a better way!
    )
  }
  return async () => { }
}

