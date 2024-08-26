import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { ApiHeaders } from './api-headers'
import { localInstanceRead } from './local-instance-read'
import { parseAs } from './parse-as'
import { FatalError } from '../invoke'

const followersResponse = t.type({
  data: t.array(t.string), // SMELL -- should be Member resources
})

type Fetcher = (headers: ApiHeaders) => (id: string) => TE.TaskEither<FatalError, ReadonlyArray<string>>

export const fetchFollowers: Fetcher = (headers) => (id) => pipe(
  `/members/${encodeURIComponent(id)}/followers`,
  localInstanceRead(headers),
  TE.chainEitherK(parseAs(followersResponse)),
  TE.map((res) => res.data),
)

