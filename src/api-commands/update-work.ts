import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as L from '../logger'
import { Work } from '../resources/work'

export const saveUpdate = (logger: L.Logger) => (work: Work): TE.TaskEither<unknown, unknown> => {
  const url = `http://commands:44001/works/${work.id}`
  return pipe(
    TE.tryCatch(
      async () => axios.patch(url, { data: work }, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => logger.error('failed to update work', { url, work, error }),
    ),
    TE.map(() => logger.debug('work updated', { work: JSON.stringify(work) })),
  )
}

