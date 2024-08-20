import * as t from 'io-ts'
import * as tt from 'io-ts-types'

const esEventBase = t.type({
  id: tt.NonEmptyString,
  created: tt.date,
})

export const inboxCommentCreatedEvent = t.intersection([esEventBase, t.type({
  type: t.literal('inbox:comment-created'),
  data: t.type({
    id: t.string,
    actorId: t.string,
    publishedAt: tt.DateFromISOString,
    entryId: t.string,
    content: t.string,
  }),
})])

export type InboxCommentCreatedEvent = t.TypeOf<typeof inboxCommentCreatedEvent>

