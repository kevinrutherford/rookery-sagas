import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

export const instantiate = (): void => {
  axiosRetry(axios, {
    retries: 3,
    retryCondition: () => true,
    retryDelay: exponentialDelay,
    onRetry: (retryCount: number, error) => {
      process.stderr.write(`Axios retry -- retryCount: ${retryCount}, error: ${error}, url: ${error.config?.url}, data: ${error.config?.data}\n`)
    },
  })
}

