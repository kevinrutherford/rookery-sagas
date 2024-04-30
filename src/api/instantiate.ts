import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'
import { createComment } from './create-comment'
import { fetchWorksAwaitingFrontMatter } from './fetch-works-awaiting-front-matter'
import { updateWork } from './update-work'
import { Logger } from '../logger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const instantiate = (logger: Logger, authToken: string) => {
  axiosRetry(axios, {
    retries: 3,
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

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  }

  return {
    createComment,
    fetchWorksAwaitingFrontMatter,
    updateWork: updateWork(headers),
  }
}

export type Api = ReturnType<typeof instantiate>

