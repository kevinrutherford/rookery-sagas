import * as E from 'fp-ts/Either'
import * as RA from 'fp-ts/ReadonlyArray'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { fetchWorks } from './fetch-works'
import { updateWork } from '../api-commands/update-work'
import { fetchCrossrefWork } from '../crossref/fetch-crossref-work'
import * as L from '../logger'
import { Work } from '../resources/work'

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
    TE.chainW((work) => pipe(
      work,
      fetchCrossrefWork(logger),
    )),
    TE.chainW(updateWork(logger)),
    T.map(() => logger.info('fetchMissingFrontMatter finished')),
  )()
}

