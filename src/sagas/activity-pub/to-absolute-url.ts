import { Config } from '../forward-outbox-activities/config'

export const toAbsoluteUrl = (env: Config) => (path: string): string => {
  const host = env.ROOKERY_HOSTNAME
    .replace(new RegExp(/\/$/), '')
    .replace(/\/api$/, '')
  const resource = path.replace(new RegExp(/^\//), '')
    .replace(/\/*api/, '')
  return /:\/\//.test(host)
    ? `${host}/api/${resource}`
    : `${host}/${resource}`
}

