import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { formatValidationErrors } from 'io-ts-reporters'
import { config, Config } from './config'
import { CommentCreated, DomainEvent, domainEvent } from './domain-event'
import { renderCommentCreatedActivity } from '../activity-pub/render-comment-created-activity'
import { Logger } from '../logger'

const logAxiosError = (logger: Logger, url: string) => (error: unknown): void => {
  const logPayload = (axios.isAxiosError(error)) ? ({
    error,
    url,
    responseBody: error.response?.data,
  }) : ({
    error,
    url,
  })
  logger.error('Outbox: Request failed', logPayload)
}

const share = async (env: Config, logger: Logger, event: CommentCreated) => {
  const url = 'http://commands:44001/inbox'
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.USER_CRB_ID}`,
  }
  const comment = renderCommentCreatedActivity(env, event)
  await pipe(
    TE.tryCatch(
      async () => axios.post(url, comment, { headers }),
      logAxiosError(logger, url),
    ),
  )()
}

const isShareable = (env: Config) => (event: DomainEvent): boolean => Object.values(env).includes(event.data.actorId)

const propagate = (env: Config, logger: Logger) => (esEvent: unknown): void => {
  const e = domainEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  logger.debug('Outbox: Event received', { type: event.type })
  if (!isShareable(env)(event))
    return
  logger.debug('Outbox: Shareable event received', { type: event.type })
  if (event.type === 'comment-created')
    share(env, logger, event)
}

export const start = (env: unknown, logger: Logger): void => {
  const vars = pipe(
    env,
    config.decode,
    E.getOrElseW((errors) => {
      logger.error('Outbox: Missing or incorrect config', {
        errors: formatValidationErrors(errors),
      })
      throw new Error('Incorrect config')
    }),
  )
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })

  subscription.on('data', (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    propagate(vars, logger)(event)
  })
}

