import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { CommentCreated, DomainEvent, domainEvent } from './domain-event'
import { Logger } from '../logger'

const config = t.type({
  ROOKERY_HOSTNAME: t.string,
  USER_A1_ID: t.string,
  USER_A2_ID: t.string,
  USER_A3_ID: t.string,
  USER_CRB_ID: t.string,
})

type Config = t.TypeOf<typeof config>

const share = async (env: Config, logger: Logger, event: CommentCreated) => {
  const url = 'http://commands:44001/inbox'
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.USER_CRB_ID}`,
  }
  const comment = {
    '@context': ['https://www.w3.org/ns/activitystreams'],
    type: 'Create',
    actor: {
      id: `${env.ROOKERY_HOSTNAME}/members/${event.data.actorId}`,
    },
    published: event.created, // SMELL -- potentially the wrong date
    object: {
      type: 'Note',
      content: event.data.content,
    },
    target: {
      type: 'discussion',
      id: event.data.entryId,
    },
  }
  await pipe(
    TE.tryCatch(
      async () => axios.post(url, comment, { headers }),
      (error) => ({
        message: 'failed to create comment',
        payload: { url, comment, error },
      }),
    ),
    TE.map((error) => {
      logger.error('Failed to write to inbox', {
        error: error.toString(),
        url,
      })
    }),
  )()
}

const isShareable = (env: Config) => (event: DomainEvent): boolean => Object.values(env).includes(event.data.actorId)

const propagate = (env: Config, logger: Logger) => (esEvent: unknown): void => {
  const e = domainEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  logger.debug('Event received', { type: event.type })
  if (event.type === 'comment-created')
    share(env, logger, event)
  if (!isShareable(env)(event))
    return
  logger.debug('Shareable event received', { type: event.type })
}

export const start = (env: unknown, logger: Logger): void => {
  const vars = pipe(
    env,
    config.decode,
    E.getOrElseW((errors) => {
      logger.error('Missing or incorrect config', {
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

