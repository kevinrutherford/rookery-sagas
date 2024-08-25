import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { apiRead } from './api-read'
import { localInstanceRead } from './local-instance-read'
import { parseAs } from './parse-as'
import { FatalError } from '../invoke'
import { Discussion, discussionResponse } from '../sagas/resources/discussion'

type Fetcher = (headers: ApiHeaders) => (id: string) => TE.TaskEither<FatalError, Discussion>

export const fetchDiscussion: Fetcher = (headers) => (id) => pipe(
  `/discussions/${encodeURIComponent(id)}`,
  localInstanceRead(headers),
  TE.chainEitherK(parseAs(discussionResponse)),
  TE.map((res) => res.data),
)

export const fetchRemoteDiscussion: Fetcher = (headers) => (id) => pipe(
  id,
  apiRead(headers),
  TE.chainEitherK(parseAs(discussionResponse)),
  TE.map((response) => response.data),
  TE.map((member) => ({
    ...member,
    id,
  })),
)

