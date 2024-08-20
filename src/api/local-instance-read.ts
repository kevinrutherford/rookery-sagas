import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { FatalError } from '../invoke'

export const localInstanceRead = (headers: ApiHeaders) => (path: string): TE.TaskEither<FatalError, unknown> => {
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

