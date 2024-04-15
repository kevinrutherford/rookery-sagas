import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { FetchFrontMatter, FrontMatterResponse } from './fetch-front-matter'
import { Api } from '../api'
import { FatalError, Saga } from '../invoke'
import { Work } from '../resources/work'

const handleResponse = (work: Work, api: Api) => (fmr: FrontMatterResponse): TE.TaskEither<FatalError, null> => {
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
        api.updateWork,
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
        api.updateWork,
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
        api.updateWork,
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
        api.updateWork,
        () => TE.left({
          message: 'could not decode Crossref response',
          payload: { error: fmr.details, doi: work.id },
        }),
      )
  }
}

export const updateWork = (fetchFrontMatter: FetchFrontMatter, api: Api) => (work: Work): Saga => pipe(
  work.id,
  fetchFrontMatter,
  TE.rightTask,
  TE.chain(handleResponse(work, api)),
)

