import * as E from 'fp-ts/Either'
import * as RA from 'fp-ts/ReadonlyArray'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { fetchWorks } from './fetch-works'
import { updateWork } from '../api-commands/update-work'
import { fetchCrossrefWork } from '../crossref/fetch-crossref-work'
import { Saga } from '../invoke'
import * as L from '../logger'
import { Work } from '../resources/work'

const selectWorkToUpdate = (works: ReadonlyArray<Work>) => pipe(
  works,
  RA.head,
  E.fromOption(() => {}),
)

export const fetchMissingFrontMatter = (logger: L.Logger): Saga => pipe(
  'http://views:44002/works?filter[crossrefStatus]=not-determined',
  fetchWorks(logger),
  TE.chainEitherKW(selectWorkToUpdate),
  TE.chainW((work) => pipe(
    work,
    fetchCrossrefWork(logger),
    TE.mapLeft((fmr) => pipe(
      {
        type: work.type,
        id: work.id,
        attributes: {
          crossrefStatus: 'not-determined',
          reason: fmr.type,
        },
      },
      updateWork(logger),
    )),
  )),
  TE.chainW(updateWork(logger)),
  T.map(() => {}),
)

