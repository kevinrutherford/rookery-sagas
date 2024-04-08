import * as L from './logger'

const doNothing = async (logger: L.Logger) => {
  logger.info('Doing nothing')
}

void (async (): Promise<void> => {
  const logger = L.create({
    emit: (s: string) => process.stdout.write(s),
    colour: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL ?? 'debug',
  })

  logger.info('Starting sagas')
  setInterval(async () => doNothing(logger), 307 * 1000)
})()

