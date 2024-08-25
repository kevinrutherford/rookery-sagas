import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { Config } from './config'
import { CommentCreated, DomainEvent, domainEvent } from './domain-event'
import { renderCommentCreatedActivity } from '../../activity-pub/render-comment-created-activity'
import { Api } from '../../api'

const share = (api: Api, env: Config, event: CommentCreated) => {
  const url = 'http://commands:44001/inbox'
  const comment = renderCommentCreatedActivity(env, event)
  return api.sendActivity(url, comment)
}

const isShareable = (env: Config) => (event: DomainEvent): boolean => Object.values(env).includes(event.data.actorId)

const propagate = (api: Api, env: Config) => (event: DomainEvent): T.Task<void> => {
  if (isShareable(env)(event) && event.type === 'comment-created')
    return share(api, env, event)
  return async () => { }
}

export const start = (api: Api, vars: Config): void => {
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })

  subscription.on('data', async (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    await pipe(
      event,
      domainEvent.decode,
      TE.fromEither,
      TE.chainTaskK(propagate(api, vars)),
    )()
  })
}

