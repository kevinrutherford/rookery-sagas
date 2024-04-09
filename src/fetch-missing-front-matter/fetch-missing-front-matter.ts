import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as RA from 'fp-ts/ReadonlyArray'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { fetchWorks } from './fetch-works'
import { Work } from './work'
import * as L from '../logger'

const crossrefResponse = t.type({
  message: t.type({
    title: t.array(t.string),
    abstract: t.string,
    author: t.array(t.type({
      given: t.string,
      family: t.string,
    })),
  }),
})

const fetchCrossrefWork = (logger: L.Logger) => (work: Work) => {
  const url = `https://api.crossref.org/works/${work.id}`
  return pipe(
    TE.tryCatch(
      async () => axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => logger.error('failed to fetch Crossref work', { url, error }),
    ),
    TE.map((res) => res.data),
    TE.chainEitherK(flow(
      crossrefResponse.decode,
      E.mapLeft((errors) => logger.error('invalid response from Crossref', { url, errors: formatValidationErrors(errors) })),
    )),
    TE.map(() => work),
  )
}

const saveUpdatedWork = (logger: L.Logger) => (work: Work) => {
  const url = `http://commands:44001/works/${work.id}`
  return pipe(
    TE.tryCatch(
      async () => axios.patch(url, { data: work }, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => logger.error('failed to update work', { url, work, error }),
    ),
    TE.map(() => logger.info('work updated', { id: work.id, 'new-status': 'not-found' })),
  )
}

const selectWorkToUpdate = (works: ReadonlyArray<Work>) => pipe(
  works,
  RA.head,
  E.fromOption(() => {}),
)

export const fetchMissingFrontMatter = async (logger: L.Logger): Promise<void> => {
  logger.info('fetchMissingFrontMatter starting')
  await pipe(
    'http://views:44002/works?filter[crossrefStatus]=not-determined',
    fetchWorks(logger),
    TE.chainEitherKW(selectWorkToUpdate),
    TE.chainW(fetchCrossrefWork(logger)),
    TE.map((work) => ({
      type: work.type,
      id: work.id,
      attributes: {
        crossrefStatus: 'not-found' as const,
      },
    })),
    TE.chainW(saveUpdatedWork(logger)),
    T.map(() => logger.info('fetchMissingFrontMatter finished')),
  )()
}

