import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { ApiHeaders } from './api-headers'
import { FatalError } from '../invoke'
import { Work, worksResponse } from '../resources/work'

type Fetcher = (headers: ApiHeaders) => () => TE.TaskEither<FatalError, ReadonlyArray<Work>>

const localInstanceRead = (headers: ApiHeaders) => (path: string): TE.TaskEither<FatalError, unknown> => {
  const url = `http://views:44002${path}`
  return pipe(
    TE.tryCatch(
      async () => axios.get(url, { headers }),
      (error) => ({
        message: 'failed to fetch works',
        payload: { url, error },
      }),
    ),
    TE.map((response) => response.data),
  )
}

const parseAs = <R>(codec: t.Decoder<unknown, R>) => (response: unknown): E.Either<FatalError, R> => pipe(
  response,
  codec.decode,
  E.mapLeft((errors) => ({
    message: 'invalid response',
    payload: { errors: formatValidationErrors(errors) },
  })),
)

export const fetchWorksAwaitingFrontMatter: Fetcher = (headers) => () => {
  return pipe(
    '/works?filter[crossrefStatus]=not-determined',
    localInstanceRead(headers),
    TE.chainEitherK(parseAs(worksResponse)),
    TE.map((res) => res.data),
  )
}

