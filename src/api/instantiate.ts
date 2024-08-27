import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { cacheDiscussion } from './cache-discussion'
import { cacheMember } from './cache-member'
import { createComment } from './create-comment'
import { fetchDiscussion, fetchRemoteDiscussion } from './fetch-discussion'
import { fetchFollowers } from './fetch-followers'
import { fetchMember, fetchRemoteMember } from './fetch-member'
import { fetchWorksAwaitingFrontMatter } from './fetch-works-awaiting-front-matter'
import { localInstanceRead } from './local-instance-read'
import { postActivity } from './post-activity'
import { updateWork } from './update-work'
import { Logger } from '../logger'

const configuration = t.type({
  USER_CRB_ID: t.string,
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const instantiate = (logger: Logger, configVariables: unknown) => {
  const config = pipe(
    configVariables,
    configuration.decode,
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
        url: error.config?.url,
      })
    },
  })

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.USER_CRB_ID}`,
  }

  return {
    cacheDiscussion: cacheDiscussion(headers),
    cacheMember: cacheMember(headers),
    createComment: createComment(headers),
    fetchDiscussion: fetchDiscussion(headers),
    fetchRemoteDiscussion: fetchRemoteDiscussion(headers),
    fetchMember: fetchMember(headers),
    fetchFollowers: fetchFollowers(headers),
    fetchRemoteMember: fetchRemoteMember(headers),
    fetchWorksAwaitingFrontMatter: fetchWorksAwaitingFrontMatter(headers),
    read: localInstanceRead(headers),
    postActivity: postActivity(headers, logger),
    updateWork: updateWork(headers),
  }
}

export type Api = ReturnType<typeof instantiate>

