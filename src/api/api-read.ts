import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { FatalError } from '../invoke'

export const apiRead = (headers: ApiHeaders) => (url: string): TE.TaskEither<FatalError, unknown> => pipe(
  TE.tryCatch(
    async () => axios.get(url, { headers }),
    (error) => ({
      message: 'failed to fetch',
      payload: { url, error },
    }),
  ),
  TE.map((response) => response.data),
)

