import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as Api from './api'
import { fetchCrossrefWork } from './crossref/fetch-crossref-work'
import { fetchMissingFrontMatter } from './fetch-missing-front-matter'
import { Saga } from './invoke'
import * as L from './logger'
import * as Outbox from './outbox'

const main = async (): Promise<void> => {
  const logger = L.create({
    emit: (s: string) => process.stdout.write(s),
    colour: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL ?? 'debug',
  })
  const api = Api.instantiate(logger, process.env)

  const invoke = (saga: Saga) => async (): Promise<void> => {
    logger.info('fetchMissingFrontMatter starting')
    await pipe(
      saga,
      TE.mapLeft((fe) => {
        logger.error(fe.message, fe.payload)
        logger.info('Terminating all sagas')
        process.exit(1)
      }),
    )()
    logger.info('fetchMissingFrontMatter finished')
  }

  logger.info('Starting outbox')
  Outbox.start()

  logger.info('Starting sagas')
  setInterval(invoke(fetchMissingFrontMatter(fetchCrossrefWork, api)), 31 * 1000)
}

main()

