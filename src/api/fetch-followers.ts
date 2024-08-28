import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { ApiHeaders } from './api-headers'
import { localInstanceRead } from './local-instance-read'
import { parseAs } from './parse-as'
import { FatalError } from '../invoke'
import { Logger } from '../logger'

const follower = t.type({
  type: t.literal('follower'),
  id: t.string,
  attributes: t.type({
    inboxUrl: t.string,
  }),
})

type Follower = t.TypeOf<typeof follower>

const followersResponse = t.type({
  data: t.array(follower),
})

type Fetcher = (headers: ApiHeaders, logger: Logger)
=> (id: string)
=> TE.TaskEither<FatalError, ReadonlyArray<Follower>>

export const fetchFollowers: Fetcher = (headers, logger) => (id) => pipe(
  `/members/${encodeURIComponent(id)}/followers`,
  localInstanceRead(headers),
  TE.chainEitherK(parseAs(followersResponse)),
  TE.bimap(
    fe => {
      logger.error(fe.message, fe.payload)
      return fe
    },
    res => res.data,
  ),
)

