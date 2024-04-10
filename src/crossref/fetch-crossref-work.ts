import axios from 'axios'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { flow, identity, pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { FrontMatterResponse } from '../fetch-missing-front-matter/front-matter-response'
import * as L from '../logger'
import { Work } from '../resources/work'

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

type CrossrefResponse = t.TypeOf<typeof crossrefResponse>

const toUpdateOf = (work: Work) => (response: CrossrefResponse): Work => ({
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
})

const isNotFound = (error: unknown) => (
  axios.isAxiosError(error) && error.response?.status !== undefined && [404, 410].includes(error.response?.status)
)

export const fetchCrossrefWork = (logger: L.Logger) => (work: Work): TE.TaskEither<FrontMatterResponse, Work> => {
  const url = `https://api.crossref.org/works/${work.id}`
  return pipe(
    TE.tryCatch(
      async () => axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => {
        if (isNotFound(error)) {
          return E.right({
            type: work.type,
            id: work.id,
            attributes: {
              crossrefStatus: 'not-found' as const,
            },
          })
        }
        logger.error('unknown error from Crossref', { error })
        return E.left({
          type: 'unavailable' as const,
          details: JSON.stringify(error),
        })
      },
    ),
    TE.map((res) => res.data),
    TE.chainEitherKW(flow(
      crossrefResponse.decode,
      E.mapLeft((errors) => {
        logger.error('invalid response from Crossref', { url, errors: formatValidationErrors(errors) })
        return E.left({
          type: 'invalid' as const,
          details: formatValidationErrors(errors).join('\n'),
        })
      }),
    )),
    TE.matchW(
      identity,
      (data) => pipe(
        data,
        toUpdateOf(work),
        E.right,
      ),
    ),
  )
}

