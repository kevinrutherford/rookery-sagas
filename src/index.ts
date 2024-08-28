import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { formatValidationErrors } from 'io-ts-reporters'
import * as Api from './api'
import { fetchCrossrefWork } from './crossref/fetch-crossref-work'
import { dispatch } from './eventstore/dispatch'
import { Saga } from './invoke'
import * as L from './logger'
import * as Inbox from './sagas/cache-inbox-activities'
import { fetchMissingFrontMatter } from './sagas/fetch-missing-front-matter'
import * as Outbox from './sagas/forward-outbox-activities'
import { config } from './sagas/forward-outbox-activities/config'

const main = async (): Promise<void> => {
  const logger = L.create({
    emit: (s: string) => process.stdout.write(s),
    colour: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL ?? 'debug',
  })

  const vars = pipe(
    process.env,
    config.decode,
    E.getOrElseW((errors) => {
      logger.error('Outbox: Missing or incorrect config', {
        errors: formatValidationErrors(errors),
      })
      throw new Error('Incorrect config')
    }),
  )

  const api = Api.instantiate(logger, process.env)

  const invoke = (saga: Saga) => async (): Promise<void> => {
    logger.info('fetchMissingFrontMatter starting')
    await pipe(
      saga,
      TE.mapLeft((fe) => {
        logger.error(fe.message, fe.payload)
      }),
    )()
    logger.info('fetchMissingFrontMatter finished')
  }

  logger.info('Starting listener sagas')
  dispatch([
    Inbox.cacheActivity(logger, api),
    Outbox.forwardActivity(api, vars, logger),
  ])

  logger.info('Starting periodic sagas')
  setInterval(invoke(fetchMissingFrontMatter(fetchCrossrefWork, api)), 31 * 1000)
}

main()

