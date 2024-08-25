import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import * as E from 'fp-ts/Either'
import { Config } from './config'
import { CommentCreated, DomainEvent, domainEvent } from './domain-event'
import { renderCommentCreatedActivity } from '../../activity-pub/render-comment-created-activity'
import { Api } from '../../api'

const share = async (api: Api, env: Config, event: CommentCreated) => {
  const url = 'http://commands:44001/inbox'
  const comment = renderCommentCreatedActivity(env, event)
  await api.sendActivity(url, comment)()
}

const isShareable = (env: Config) => (event: DomainEvent): boolean => Object.values(env).includes(event.data.actorId)

const propagate = (api: Api, env: Config) => (esEvent: unknown): void => {
  const e = domainEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  if (!isShareable(env)(event))
    return
  if (event.type === 'comment-created')
    share(api, env, event)
}

export const start = (api: Api, vars: Config): void => {
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })

  subscription.on('data', (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    propagate(api, vars)(event)
  })
}

