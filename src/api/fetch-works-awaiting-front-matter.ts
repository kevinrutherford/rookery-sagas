import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/function'
import { formatValidationErrors } from 'io-ts-reporters'
import { FatalError } from '../invoke'
import { Work, worksResponse } from '../resources/work'

export const fetchWorksAwaitingFrontMatter = (): TE.TaskEither<FatalError, ReadonlyArray<Work>> => {
  const url = 'http://views:44002/works?filter[crossrefStatus]=not-determined'
  return pipe(
    TE.tryCatch(
      async () => axios.get(url, {
        headers: { 'Accept': 'application/json' },
      }),
      (error) => ({
        message: 'failed to fetch works',
        payload: { url, error },
      }),
    ),
    TE.map((response) => response.data),
    TE.chainEitherKW(flow(
      worksResponse.decode,
      E.mapLeft((errors) => ({
        message: 'invalid response',
        payload: { url, errors: formatValidationErrors(errors) },
      })),
    )),
    TE.map((res) => res.data),
  )
}

