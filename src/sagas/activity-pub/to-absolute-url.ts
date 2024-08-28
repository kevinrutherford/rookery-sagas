import { Config } from '../forward-outbox-activities/config'

export const toAbsoluteUrl = (env: Config) => (path: string): string => (
  `${env.ROOKERY_HOSTNAME}/members/${path}`
)

