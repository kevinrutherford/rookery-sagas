import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { apiRead } from './api-read'
import { FatalError } from '../invoke'

export const localInstanceRead = (headers: ApiHeaders) => (path: string): TE.TaskEither<FatalError, unknown> => pipe(
  `http://views:44002${path}`,
  apiRead(headers),
)

