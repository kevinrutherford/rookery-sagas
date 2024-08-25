import * as t from 'io-ts'
import * as tt from 'io-ts-types'

const esEventBase = t.type({
  id: tt.NonEmptyString,
  created: tt.date,
})

const collectionCreatedEvent = t.intersection([esEventBase, t.type({
  type: t.literal('collection-created'),
  data: t.type({
    id: t.string,
    actorId: t.string,
    name: t.string,
    description: t.string,
  }),
})])

const commentCreatedEvent = t.intersection([esEventBase, t.type({
  type: t.literal('comment-created'),
  data: t.type({
    id: t.string,
    actorId: t.string,
    discussionId: t.string,
    content: t.string,
  }),
})])

export type CommentCreated = t.TypeOf<typeof commentCreatedEvent>

const doiEnteredEvent = t.intersection([esEventBase, t.type({
  type: t.literal('discussion-started'),
  data: t.type({
    actorId: t.string,
    discussionId: t.string,
    doi: t.string,
    collectionId: t.string,
  }),
})])

const inboxCommentCreatedEvent = t.intersection([esEventBase, t.type({
  type: t.literal('inbox:comment-created'),
  data: t.type({
    id: t.string,
    actorId: t.string,
    publishedAt: tt.DateFromISOString,
    discussionId: t.string,
    content: t.string,
  }),
})])

export type InboxCommentCreatedEvent = t.TypeOf<typeof inboxCommentCreatedEvent>

export const domainEvent = t.union([
  collectionCreatedEvent,
  commentCreatedEvent,
  doiEnteredEvent,
  inboxCommentCreatedEvent,
])

export type DomainEvent = {
  id: string,
  created: Date,
} & t.TypeOf<typeof domainEvent>

