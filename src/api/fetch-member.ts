import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { apiRead } from './api-read'
import { localInstanceRead } from './local-instance-read'
import { parseAs } from './parse-as'
import { FatalError } from '../invoke'
import { Member, memberResponse } from '../resources/member'

type Fetcher = (headers: ApiHeaders) => (id: string) => TE.TaskEither<FatalError, Member>

export const fetchMember: Fetcher = (headers) => (id) => pipe(
  `/members/${encodeURIComponent(id)}`,
  localInstanceRead(headers),
  TE.chainEitherK(parseAs(memberResponse)),
  TE.map((res) => res.data),
)

export const fetchRemoteMember: Fetcher = (headers) => (id) => pipe(
  id,
  apiRead(headers),
  TE.chainEitherK(parseAs(memberResponse)),
  TE.map((res) => res.data),
)

