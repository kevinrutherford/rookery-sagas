import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { createComment } from './create-comment'
import { fetchWorksAwaitingFrontMatter } from './fetch-works-awaiting-front-matter'
import { updateWork } from './update-work'
import { Logger } from '../logger'

const configCodec = t.type({
  DEVELOPMENT_BEARER_TOKEN: t.string,
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const instantiate = (logger: Logger, config: unknown) => {
  const cf = pipe(
    config,
    configCodec.decode,
    E.getOrElseW((errors) => {
      logger.error('Invalid configuration', { errors: formatValidationErrors(errors) })
      throw new Error('Incorrect configuration provided')
    }),
  )

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
    'Authorization': `Bearer ${cf.DEVELOPMENT_BEARER_TOKEN}`,
  }

  return {
    createComment: createComment(headers),
    fetchWorksAwaitingFrontMatter: fetchWorksAwaitingFrontMatter(headers),
    updateWork: updateWork(headers),
  }
}

export type Api = ReturnType<typeof instantiate>

