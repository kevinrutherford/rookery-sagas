import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { ApiHeaders } from './api-headers'
import { FatalError } from '../invoke'
import { Member } from '../resources/member'

export const cacheMember = (headers: ApiHeaders) => (member: Member): TE.TaskEither<FatalError, null> => {
  const url = 'http://commands:44001/cache/members' // SMELL -- duplicate knowledge of local ports
  return pipe(
    TE.tryCatch(
      async () => axios.post(url, { data: member }, { headers }),
      (error) => ({
        message: 'failed to cache member',
        payload: { url, member, error },
      }),
    ),
    TE.map(() => null),
  )
}

