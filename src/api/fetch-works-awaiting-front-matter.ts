import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { localInstanceRead } from './local-instance-read'
import { parseAs } from './parse-as'
import { FatalError } from '../invoke'
import { Work, worksResponse } from '../resources/work'

type Fetcher = (headers: ApiHeaders) => () => TE.TaskEither<FatalError, ReadonlyArray<Work>>

export const fetchWorksAwaitingFrontMatter: Fetcher = (headers) => () => {
  return pipe(
    '/works?filter[crossrefStatus]=not-determined',
    localInstanceRead(headers),
    TE.chainEitherK(parseAs(worksResponse)),
    TE.map((res) => res.data),
  )
}

