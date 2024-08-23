import * as t from 'io-ts'
import * as tt from 'io-ts-types'

const discussion = t.type({
  type: t.literal('discussion'),
  id: t.string,
  attributes: t.type({
    addedAt: tt.DateFromISOString,
    commentsCount: t.number,
    title: t.string,
  }),
})

export const discussionResponse = t.type({
  data: discussion,
})

type DiscussionResponse = t.TypeOf<typeof discussionResponse>

export type Discussion = DiscussionResponse['data']

