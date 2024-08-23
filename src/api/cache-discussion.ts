import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { FatalError } from '../invoke'
import { Discussion } from '../resources/discussion'

export const cacheDiscussion = (headers: ApiHeaders) => (discussion: Discussion): TE.TaskEither<FatalError, null> => {
  const url = 'http://commands:44001/cache/discussions' // SMELL -- duplicate knowledge of local ports
  return pipe(
    TE.tryCatch(
      async () => axios.post(url, { data: discussion }, { headers }),
      (error) => ({
        message: 'failed to cache discussion',
        payload: { url, discussion, error },
      }),
    ),
    TE.map(() => null),
  )
}

