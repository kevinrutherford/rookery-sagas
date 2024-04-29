import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { FatalError } from '../invoke'
import { UpdateWorkCommand } from '../resources/work'

export const updateWork = (authToken: string) => (cmd: UpdateWorkCommand): TE.TaskEither<FatalError, null> => {
  const url = `http://commands:44001/works/${cmd.id}`
  return pipe(
    TE.tryCatch(
      async () => axios.patch(url, { data: cmd }, { headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      } }),
      (error) => ({
        message: 'failed to update work',
        payload: { url, cmd, error },
      }),
    ),
    TE.map(() => null),
  )
}

