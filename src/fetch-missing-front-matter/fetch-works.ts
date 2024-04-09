import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/function'
import { formatValidationErrors } from 'io-ts-reporters'
import { Work, worksResponse } from './work'
import * as L from '../logger'

export const fetchWorks = (logger: L.Logger) => (url: string): TE.TaskEither<unknown, ReadonlyArray<Work>> => pipe(
  TE.tryCatch(
    async () => axios.get(url, {
      headers: { 'Accept': 'application/json' },
    }),
    (error) => logger.error('failed to fetch works', { url, error }),
  ),
  TE.map((response) => response.data),
  TE.chainEitherK(flow(
    worksResponse.decode,
    E.mapLeft((errors) => logger.error('invalid response', { url, errors: formatValidationErrors(errors) })),
  )),
  TE.map((res) => res.data),
)

