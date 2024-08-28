import { Config } from '../forward-outbox-activities/config'

export const toAbsoluteUrl = (env: Config) => (path: string): string => {
  const host = env.ROOKERY_HOSTNAME.replace(new RegExp(/\/$/), '')
  const resource = path.replace(new RegExp(/^\//), '')
  return `${host}/${resource}`
}

