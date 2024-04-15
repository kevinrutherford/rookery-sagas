import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { FatalError } from '../invoke'
import { Work } from '../resources/work'

export const updateWork = (work: Work): TE.TaskEither<FatalError, null> => {
  const url = `http://commands:44001/works/${work.id}`
  return pipe(
    TE.tryCatch(
      async () => axios.patch(url, { data: work }, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => ({
        message: 'failed to update work',
        payload: { url, work, error },
      }),
    ),
    TE.map(() => null),
  )
}

