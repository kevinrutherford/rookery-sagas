import * as t from 'io-ts'
import * as tt from 'io-ts-types'

const notDetermined = t.type({
  crossrefStatus: t.literal('not-determined'),
  reason: t.union([t.literal('never-fetched'), t.literal('response-unavailable'), t.literal('response-invalid')]),
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

const frontMatter = t.union([notDetermined, notFound, found])

const unresolvedWork = t.type({
  type: t.literal('work'),
  id: t.string,
  attributes: t.intersection([
    t.interface({ updatedAt: tt.DateFromISOString }),
    notDetermined,
  ]),
})

export const worksResponse = t.type({
  data: t.array(unresolvedWork),
})

type WorkResponse = t.TypeOf<typeof worksResponse>

export type Work = WorkResponse['data'][number]

type FrontMatter = t.TypeOf<typeof frontMatter>

export type UpdateWorkCommand = {
  type: Work['type'],
  id: Work['id'],
  attributes: FrontMatter,
}

