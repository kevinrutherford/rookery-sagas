/* eslint-disable @typescript-eslint/no-unused-vars */
import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { inboxCommentCreatedEvent, InboxCommentCreatedEvent } from './domain-event'
import { Api } from '../api'
import { Logger } from '../logger'

const config = t.type({
  ROOKERY_HOSTNAME: t.string,
  USER_A1_ID: t.string,
  USER_A2_ID: t.string,
  USER_A3_ID: t.string,
  USER_CRB_ID: t.string,
})

type Config = t.TypeOf<typeof config>

const ensureLocalMemberNotCachedAlready = (api: Api) => (id: string): TE.TaskEither<unknown, string> => pipe(
  `/members/${encodeURIComponent(id)}`,
  api.read,
  TE.match(
    () => E.right(id),
    () => E.left(''),
  ),
)

type Member = {
  id: string,
}

const fetchRemoteMember = (id: string): TE.TaskEither<unknown, Member> => TE.left('')

const cacheMemberLocally = (member: Member): TE.TaskEither<unknown, void> => TE.left('')

const fetchActor = async (api: Api, event: InboxCommentCreatedEvent) => {
  await pipe(
    event.data.actorId,
    ensureLocalMemberNotCachedAlready(api),
    TE.chain(fetchRemoteMember),
    TE.chain(cacheMemberLocally),
  )()
}

const propagate = (logger: Logger, api: Api) => (esEvent: unknown): void => {
  const e = inboxCommentCreatedEvent.decode(esEvent)
  if (E.isLeft(e))
    return
  const event = e.right
  logger.debug('Inbox: Event received', { type: event.type })
  if (event.type === 'inbox:comment-created')
    fetchActor(api, event)
}

export const start = (logger: Logger, api: Api): void => {
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })

  subscription.on('data', (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    propagate(logger, api)(event)
  })
}

