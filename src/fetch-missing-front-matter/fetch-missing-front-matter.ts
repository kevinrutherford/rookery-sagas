import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as api from '../api'
import { fetchCrossrefWork } from '../crossref/fetch-crossref-work'
import { Saga } from '../invoke'
import * as L from '../logger'
import { Work } from '../resources/work'

const updateWork = (logger: L.Logger) => (work: Work): Saga => pipe(
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
    api.updateWork(logger),
  )),
  TE.chain(api.updateWork(logger)),
  TE.mapBoth(
    (err) => ({
      message: JSON.stringify(err),
      payload: { err },
    }),
    () => null,
  ),
)

export const fetchMissingFrontMatter = (logger: L.Logger): Saga => pipe(
  api.fetchWorksAwaitingFrontMatter(),
  TE.map(RA.head),
  TE.chain(O.match(
    () => TE.right(null),
    updateWork(logger),
  )),
)

