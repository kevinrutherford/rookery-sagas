import * as t from 'io-ts'

const notDetermined = t.type({
  crossrefStatus: t.literal('not-determined'),
})

const notFound = t.type({
  crossrefStatus: t.literal('not-found'),
})

const found = t.type({
  crossrefStatus: t.literal('found'),
  title: t.string,
  abstract: t.string,
  authors: t.array(t.string),
})

const work = t.type({
  type: t.literal('work'),
  id: t.string,
  attributes: t.union([notDetermined, notFound, found]),
})

export const worksResponse = t.type({
  data: t.array(work),
})

type WorkResponse = t.TypeOf<typeof worksResponse>

export type Work = WorkResponse['data'][number]

