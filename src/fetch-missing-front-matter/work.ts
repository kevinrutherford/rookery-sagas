import * as t from 'io-ts'

export const worksResponse = t.type({
  data: t.array(t.type({
    type: t.literal('work'),
    id: t.string,
    attributes: t.type({
      crossrefStatus: t.literal('not-determined'),
    }),
  })),
})

type WorkResponse = t.TypeOf<typeof worksResponse>

export type Work = WorkResponse['data'][number]

