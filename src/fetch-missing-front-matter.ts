import axios from 'axios'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import * as L from './logger'

const workResponse = t.type({
  data: t.array(t.type({
    type: t.literal('work'),
    id: t.string,
    attributes: t.type({
      crossrefStatus: t.literal('not-determined'),
    }),
  })),
})

type WorkResponse = t.TypeOf<typeof workResponse>

const recordNotFound = (logger: L.Logger) => (work: WorkResponse['data'][number]) => pipe(
  TE.tryCatch(
    async () => axios.patch(`http://commands:44001/works/${work.id}`, {
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
    (error) => logger.error('failed to update work', {
      url: `http://commands:44001/works/${work.id}`,
      work,
      error,
    }),
  ),
  TE.map(() => logger.info('work updated')),
)

export const fetchMissingFrontMatter = async (logger: L.Logger): Promise<void> => {
  logger.info('fetchMissingFrontMatter starting')
  const url = 'http://views:44002/works?filter[crossrefStatus]=not-determined'
  await pipe(
    TE.tryCatch(
      async () => axios.get(url, {
        headers: {
          'User-Agent': 'fetchMissingFrontMatter',
          'Accept': 'application/json',
        },
      }),
      (error) => logger.error('failed to fetch works', { url, error }),
    ),
    TE.map((response) => response.data),
    TE.chainEitherK(flow(
      workResponse.decode,
      E.mapLeft((errors) => logger.error('invalid response', { url, errors: formatValidationErrors(errors) })),
    )),
    TE.map((res) => res.data),
    TE.map(RA.head),
    TE.chainW(O.match(
      () => TE.right<void, undefined>(undefined),
      recordNotFound(logger),
    )),
    T.map(() => logger.info('fetchMissingFrontMatter finished')),
  )()
}

