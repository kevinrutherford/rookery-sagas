import { Config } from './config'
import { CommentCreated, DomainEvent } from './domain-event'
import { renderCommentCreatedActivity } from '../../activity-pub/render-comment-created-activity'
import { Api } from '../../api'
import { Listener } from '../../eventstore/dispatch'

const share = (api: Api, env: Config, event: CommentCreated) => {
  const url = 'http://commands:44001/inbox'
  const comment = renderCommentCreatedActivity(env, event)
  return api.sendActivity(url, comment)
}

const isShareable = (env: Config) => (event: DomainEvent): boolean => Object.values(env).includes(event.data.actorId)

export const propagate = (api: Api, env: Config): Listener => (event) => {
  if (isShareable(env)(event) && event.type === 'comment-created')
    return share(api, env, event)
  return async () => { }
}

