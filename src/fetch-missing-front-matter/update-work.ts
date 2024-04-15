import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { FrontMatterResponse } from './front-matter-response'
import * as api from '../api'
import { fetchCrossrefWork } from '../crossref/fetch-crossref-work'
import { FatalError, Saga } from '../invoke'
import * as L from '../logger'
import { Work } from '../resources/work'

const handleResponse = (
  logger: L.Logger,
  upd: typeof api.updateWork,
  work: Work,
) => (fmr: FrontMatterResponse): TE.TaskEither<FatalError, null> => {
  switch (fmr.type) {
    case 'response-unavailable':
    case 'response-invalid':
      return pipe(
        {
          type: work.type,
          id: work.id,
          attributes: {
            crossrefStatus: 'not-determined',
            reason: fmr.type,
          },
        },
        upd(logger),
        TE.mapLeft((err) => ({
          message: JSON.stringify(err),
          payload: { err },
        })),
      )
  }
}

export const updateWork = (logger: L.Logger) => (work: Work): Saga => pipe(
  work,
  fetchCrossrefWork(logger),
  TE.mapLeft(handleResponse(logger, api.updateWork, work)),
  TE.chain(api.updateWork(logger)),
  TE.mapLeft((err) => ({
    message: JSON.stringify(err),
    payload: { err },
  })),
)

