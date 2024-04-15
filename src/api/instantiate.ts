import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'
import { fetchWorksAwaitingFrontMatter } from './fetch-works-awaiting-front-matter'
import { updateWork } from './update-work'
import { Logger } from '../logger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const instantiate = (logger: Logger) => {
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

  return {
    fetchWorksAwaitingFrontMatter,
    updateWork,
  }
}

export type Api = ReturnType<typeof instantiate>

