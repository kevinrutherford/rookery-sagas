import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'
import { fetchMissingFrontMatter } from './fetch-missing-front-matter'
import { Saga } from './invoke'
import * as L from './logger'

const main = async (): Promise<void> => {
  const logger = L.create({
    emit: (s: string) => process.stdout.write(s),
    colour: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL ?? 'debug',
  })

  const invoke = (saga: Saga) => pipe(
    saga,
    T.map(() => logger.info('fetchMissingFrontMatter finished')),
  )

  logger.info('Starting sagas')
  setInterval(invoke(fetchMissingFrontMatter(logger)), 67 * 1000)
}

main()

