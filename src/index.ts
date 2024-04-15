import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as api from './api'
import { fetchCrossrefWork } from './crossref/fetch-crossref-work'
import { fetchMissingFrontMatter } from './fetch-missing-front-matter'
import { Saga } from './invoke'
import * as L from './logger'

const main = async (): Promise<void> => {
  const logger = L.create({
    emit: (s: string) => process.stdout.write(s),
    colour: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL ?? 'debug',
  })
  api.instantiate()

  const invoke = (saga: Saga) => async (): Promise<void> => {
    logger.info('fetchMissingFrontMatter starting')
    await pipe(
      saga,
      TE.mapLeft((fe) => {
        logger.error(fe.message, fe.payload)
        process.exit(1)
      }),
    )()
    logger.info('fetchMissingFrontMatter finished')
  }

  logger.info('Starting sagas')
  setInterval(invoke(fetchMissingFrontMatter(fetchCrossrefWork)), 31 * 1000)
}

main()

