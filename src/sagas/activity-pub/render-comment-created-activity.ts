import { Json } from 'io-ts-types'
import { CommentCreated } from '../domain-event'
import { Config } from '../forward-outbox-activities/config'

export const renderCommentCreatedActivity = (env: Config, event: CommentCreated): Json => ({
  '@context': ['https://www.w3.org/ns/activitystreams'],
  type: 'Create',
  actor: {
    id: `${env.ROOKERY_HOSTNAME}/api/members/${event.data.actorId}`,
  },
  published: event.created.toISOString(), // SMELL -- potentially the wrong date
  object: {
    type: 'Note',
    content: event.data.content,
  },
  target: {
    type: 'discussion',
    id: `${env.ROOKERY_HOSTNAME}/api/discussions/${event.data.discussionId}`,
  },
})
