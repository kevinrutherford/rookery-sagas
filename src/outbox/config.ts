import * as t from 'io-ts'

export const config = t.type({
  ROOKERY_HOSTNAME: t.string,
  USER_A1_ID: t.string,
  USER_A2_ID: t.string,
  USER_A3_ID: t.string,
  USER_CRB_ID: t.string,
})

export type Config = t.TypeOf<typeof config>

