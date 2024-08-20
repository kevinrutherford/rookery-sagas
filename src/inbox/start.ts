/* eslint-disable @typescript-eslint/no-unused-vars */
import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { inboxCommentCreatedEvent, InboxCommentCreatedEvent } from './domain-event'
import { Logger } from '../logger'

const config = t.type({
  ROOKERY_HOSTNAME: t.string,
  USER_A1_ID: t.string,
  USER_A2_ID: t.string,
  USER_A3_ID: t.string,
  USER_CRB_ID: t.string,
})

type Config = t.TypeOf<typeof config>

const ensureLocalMemberNotCachedAlready = (env: Config, logger: Logger) =>
  (id: string): TE.TaskEither<unknown, string> => {
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${env.USER_CRB_ID}`,
    }
    return pipe(
      TE.tryCatch(
        async () => axios.get(`http://views:44002/members/${encodeURIComponent(id)}`, { headers }),
        (e) => {
          logger.error('Inbox: Could not contact readmodel', { e })
        },
      ),
      TE.match(
        () => {
          logger.info(`Actor ${id} not found locally`)
          return E.right(id)
        },
        () => {
          logger.info(`Actor ${id} found locally!`)
          return E.left('')
        },
      ),
    )
  }

type Member = {
  id: string,
}

const fetchRemoteMember = (id: string): TE.TaskEither<unknown, Member> => {
  return TE.left('')
}

const cacheMemberLocally = (member: Member): TE.TaskEither<unknown, void> => {
  return TE.left('')
}

const fetchActor = async (env: Config, logger: Logger, event: InboxCommentCreatedEvent) => {
  await pipe(
    event.data.actorId,
    ensureLocalMemberNotCachedAlready(env, logger),
    TE.chain(fetchRemoteMember),
    TE.chain(cacheMemberLocally),
  )()
}

const propagate = (env: Config, logger: Logger) => (esEvent: unknown): void => {
  const e = inboxCommentCreatedEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  logger.debug('Inbox: Event received', { type: event.type })
  if (event.type === 'inbox:comment-created')
    fetchActor(env, logger, event)
}

export const start = (env: unknown, logger: Logger): void => {
  const vars = pipe(
    env,
    config.decode,
    E.getOrElseW((errors) => {
      logger.error('Inbox: Missing or incorrect config', {
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
