import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as RA from 'fp-ts/ReadonlyArray'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { fetchWorks } from './fetch-works'
import { Work } from './work'
import * as L from '../logger'

const recordNotFound = (logger: L.Logger) => (work: Work) => {
  const url = `http://commands:44001/works/${work.id}`
  return pipe(
    TE.tryCatch(
      async () => axios.patch(url, {
        data: {
          type: work.type,
          id: work.id,
          attributes: {
            crossrefStatus: 'not-found',
          },
        },
      }, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => logger.error('failed to update work', { url, work, error }),
    ),
    TE.map(() => logger.info('work updated', { id: work.id, 'new-status': 'not-found' })),
  )
}

const selectWorkToUpdate = (works: ReadonlyArray<Work>) => pipe(
  works,
  RA.head,
  E.fromOption(() => {}),
)

export const fetchMissingFrontMatter = async (logger: L.Logger): Promise<void> => {
  logger.info('fetchMissingFrontMatter starting')
  await pipe(
    'http://views:44002/works?filter[crossrefStatus]=not-determined',
    fetchWorks(logger),
    TE.chainEitherKW(selectWorkToUpdate),
    TE.chainW(recordNotFound(logger)),
    T.map(() => logger.info('fetchMissingFrontMatter finished')),
  )()
}

