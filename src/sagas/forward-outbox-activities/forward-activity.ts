import * as RA from 'fp-ts/ReadonlyArray'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { Config } from './config'
import { Api } from '../../api'
import { renderCommentCreatedActivity } from '../activity-pub/render-comment-created-activity'
import { Listener } from '../listener'

export const forwardActivity = (api: Api, env: Config): Listener => (event) => {
  switch (event.type) {
    case 'comment-created':
      const activity = renderCommentCreatedActivity(env, event)
      return pipe(
        event.data.actorId,
        api.fetchFollowers,
        TE.map(RA.map((follower) => follower.attributes.inboxUrl)),
        TE.chain(TE.traverseArray(api.postActivity(activity))),
        TE.toUnion,
        T.map(() => undefined),
      )
    default:
      return T.of(undefined)
  }
}

