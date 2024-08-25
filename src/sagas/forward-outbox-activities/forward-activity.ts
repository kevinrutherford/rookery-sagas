import * as T from 'fp-ts/Task'
import { Config } from './config'
import { Api } from '../../api'
import { renderCommentCreatedActivity } from '../activity-pub/render-comment-created-activity'
import { CommentCreated, DomainEvent } from '../domain-event'
import { Listener } from '../listener'

const share = (api: Api, env: Config, event: CommentCreated) => {
  const url = 'http://commands:44001/inbox'
  const comment = renderCommentCreatedActivity(env, event)
  return api.sendActivity(url, comment)
}

const isShareable = (env: Config) => (event: DomainEvent): boolean => Object.values(env).includes(event.data.actorId)

export const forwardActivity = (api: Api, env: Config): Listener => (event) => {
  switch (event.type) {
    case 'comment-created':
      if (isShareable(env)(event))
        return share(api, env, event)
    default:
      return T.of(undefined)
  }
}

