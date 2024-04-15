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
    case 'found':
      return pipe(
        {
          type: work.type,
          id: work.id,
          attributes: {
            crossrefStatus: 'found',
            title: fmr.title,
            abstract: fmr.abstract,
            authors: fmr.authors,
          },
        },
        upd(logger),
        TE.mapLeft((err) => ({
          message: JSON.stringify(err),
          payload: { err },
        })),
      )
    case 'not-found':
      return pipe(
        {
          type: work.type,
          id: work.id,
          attributes: {
            crossrefStatus: 'not-found',
          },
        },
        upd(logger),
        TE.mapLeft((err) => ({
          message: JSON.stringify(err),
          payload: { err },
        })),
      )
    case 'response-unavailable':
      return pipe(
        {
          type: work.type,
          id: work.id,
          attributes: {
            crossrefStatus: 'not-determined',
            reason: 'response-unavailable',
          },
        },
        upd(logger),
        TE.mapLeft((err) => ({
          message: JSON.stringify(err),
          payload: { err },
        })),
      )
    case 'response-invalid':
      return pipe(
        {
          type: work.type,
          id: work.id,
          attributes: {
            crossrefStatus: 'not-determined',
            reason: 'response-invalid',
          },
        },
        upd(logger),
        () => TE.left({
          message: 'could not decode Crossref response',
          payload: { error: fmr.details, doi: work.id },
        }),
      )
  }
}

export const updateWork = (logger: L.Logger) => (work: Work): Saga => pipe(
  work.id,
  fetchCrossrefWork(logger),
  TE.rightTask,
  TE.chain(handleResponse(logger, api.updateWork, work)),
)

