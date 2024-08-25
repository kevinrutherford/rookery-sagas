import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'
import { Config } from './config'
import { Api } from '../../api'
import { renderCommentCreatedActivity } from '../activity-pub/render-comment-created-activity'
import { DomainEvent } from '../domain-event'
import { Listener } from '../listener'

const isShareable = (env: Config) => (event: DomainEvent): boolean => Object.values(env).includes(event.data.actorId)

export const forwardActivity = (api: Api, env: Config): Listener => (event) => {
  switch (event.type) {
    case 'comment-created':
      const activity = renderCommentCreatedActivity(env, event)
      if (isShareable(env)(event)) {
        return pipe(
          'http://commands:44001/inbox',
          api.postActivity(activity),
        )
      }
    default:
      return T.of(undefined)
  }
}

