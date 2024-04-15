import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'
import { Logger } from '../logger'

export const instantiate = (logger: Logger): void => {
  axiosRetry(axios, {
    retries: 3,
    retryCondition: () => true,
    retryDelay: exponentialDelay,
    onRetry: (retryCount: number, error) => {
      logger.debug('Axios retry', {
        retryCount,
        error: JSON.stringify(error),
        url: error.config?.url,
        data: error.config?.data,
      })
    },
  })
}

