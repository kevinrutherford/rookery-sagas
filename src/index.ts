import * as L from './logger'

const doNothing = async () => {
  console.log('Doing nothing')
}

void (async (): Promise<void> => {
  const logger = L.create({
    emit: (s: string) => process.stdout.write(s),
    colour: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL ?? 'debug',
  })

  logger.info('Starting sagas')
  setInterval(async () => doNothing(), 307 * 1000)
})()

