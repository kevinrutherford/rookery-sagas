import { Json } from 'io-ts-types'
import { toAbsoluteUrl } from './to-absolute-url'
import { CommentCreated } from '../domain-event'
import { Config } from '../forward-outbox-activities/config'

export const renderCommentCreatedActivity = (env: Config, event: CommentCreated): Json => ({
  '@context': ['https://www.w3.org/ns/activitystreams'],
  type: 'Create',
  actor: {
    id: toAbsoluteUrl(env)(`/members/${event.data.actorId}`), // SMELL -- HATEOAS somehow
  },
  published: event.created.toISOString(), // SMELL -- potentially the wrong date
  object: {
    type: 'Note',
    content: event.data.content,
  },
  target: {
    type: 'discussion',
    id: toAbsoluteUrl(env)(`/discussions/${event.data.discussionId}`),
  },
})

