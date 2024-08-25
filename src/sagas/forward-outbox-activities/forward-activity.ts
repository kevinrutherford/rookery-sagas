import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'
import { Config } from './config'
import { Api } from '../../api'
import { renderCommentCreatedActivity } from '../activity-pub/render-comment-created-activity'
import { Listener } from '../listener'

const getFollowers = (env: Config) => (actorId: string) => (
  Object.values(env).includes(actorId) ? ['http://commands:44001/inbox'] : []
)

export const forwardActivity = (api: Api, env: Config): Listener => (event) => {
  switch (event.type) {
    case 'comment-created':
      const activity = renderCommentCreatedActivity(env, event)
      return pipe(
        event.data.actorId,
        getFollowers(env),
        T.traverseArray(api.postActivity(activity)),
        T.map(() => undefined),
      )
    default:
      return T.of(undefined)
  }
}

