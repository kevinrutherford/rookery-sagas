import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as api from '../api'
import { fetchCrossrefWork } from '../crossref/fetch-crossref-work'
import { Saga } from '../invoke'
import * as L from '../logger'
import { Work } from '../resources/work'

export const updateWork = (logger: L.Logger) => (work: Work): Saga => pipe(
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
  TE.mapLeft((err) => ({
    message: JSON.stringify(err),
    payload: { err },
  })),
)

