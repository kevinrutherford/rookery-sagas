import * as t from 'io-ts'

const member = t.type({
  type: t.literal('member'),
  id: t.string,
  attributes: t.type({
    username: t.string,
    display_name: t.string,
    avatar_url: t.string,
    followingCount: t.number,
  }),
})

export const memberResponse = t.type({
  data: member,
})

type MemberResponse = t.TypeOf<typeof memberResponse>

export type Member = MemberResponse['data']

