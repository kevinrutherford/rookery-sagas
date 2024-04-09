import axios from 'axios'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
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

export const fetchCrossrefWork = (logger: L.Logger) => (work: Work): TE.TaskEither<unknown, Work> => {
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
    TE.map((response) => ({
      type: work.type,
      id: work.id,
      attributes: {
        crossrefStatus: 'found' as const,
        title: response.message.title[0],
        abstract: response.message.abstract,
        authors: pipe(
          response.message.author,
          A.map((a) => `${a.given} ${a.family}`),
        ),
      },
    })),
  )
}

