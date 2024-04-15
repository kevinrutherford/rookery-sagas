import axios from 'axios'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { FetchFrontMatter, FrontMatterResponse } from '../fetch-missing-front-matter/fetch-front-matter'

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

const isNotFound = (error: unknown) => (
  axios.isAxiosError(error) && error.response?.status !== undefined && [404, 410].includes(error.response?.status)
)

export const fetchCrossrefWork: FetchFrontMatter = (doi) => {
  const url = `https://api.crossref.org/works/${doi}`
  return pipe(
    TE.tryCatch(
      async () => axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => {
        if (isNotFound(error)) {
          return ({
            type: 'not-found' as const,
          } satisfies FrontMatterResponse)
        }
        return ({
          type: 'response-unavailable' as const,
          details: JSON.stringify(error),
        } satisfies FrontMatterResponse)
      },
    ),
    TE.map((res) => res.data),
    TE.chainEitherKW(flow(
      crossrefResponse.decode,
      E.mapLeft((errors) => {
        return ({
          type: 'response-invalid' as const,
          details: formatValidationErrors(errors).join('\n'),
        } satisfies FrontMatterResponse)
      }),
    )),
    TE.map((response) => ({
      type: 'found',
      title: response.message.title[0],
      abstract: response.message.abstract,
      authors: pipe(
        response.message.author,
        A.map((a) => `${a.given} ${a.family}`),
      ),
    } satisfies FrontMatterResponse)),
    TE.toUnion,
  )
}

