import axios from 'axios'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { Json } from 'io-ts-types'
import { ApiHeaders } from './api-headers'
import { Logger } from '../logger'

const logAxiosError = (logger: Logger, url: string) => (error: unknown): void => {
  const logPayload = (axios.isAxiosError(error)) ? ({
    error,
    url,
    responseBody: error.response?.data,
  }) : ({
    error,
    url,
  })
  logger.error('Outbox: Request failed', logPayload)
}

export const sendActivity = (headers: ApiHeaders, logger: Logger) =>
  (url: string, activity: Json): T.Task<void> => pipe(
    TE.tryCatch(
      async () => axios.post(url, activity, { headers }),
      logAxiosError(logger, url),
    ),
    TE.toUnion,
    T.map(() => { }),
  )

