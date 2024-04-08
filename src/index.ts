import { fetchMissingFrontMatter } from './fetch-missing-front-matter'
import * as L from './logger'

void (async (): Promise<void> => {
  const logger = L.create({
    emit: (s: string) => process.stdout.write(s),
    colour: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL ?? 'debug',
  })

  logger.info('Starting sagas')
  setInterval(async () => fetchMissingFrontMatter(logger), 67 * 1000)
})()

