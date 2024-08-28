import { arbitraryWord } from '../../../helpers'
import { toAbsoluteUrl } from '../../../src/sagas/activity-pub/to-absolute-url'
import { Config } from '../../../src/sagas/forward-outbox-activities/config'

describe('toAbsoluteUrl', () => {
  describe.each([
    ['https://subdomain.example.com'],
  ])('given the ROOKERY_HOSTNAME "%s"', (hostname) => {
    const path = arbitraryWord()
    const env: Config = {
      ROOKERY_HOSTNAME: hostname,
      USER_A1_ID: arbitraryWord(),
      USER_A2_ID: arbitraryWord(),
      USER_A3_ID: arbitraryWord(),
      USER_CRB_ID: arbitraryWord(),
    }
    const result = toAbsoluteUrl(env)(path)

    it('ends with the given path', () => {
      expect(result).toMatch(new RegExp(`.*${path}$`))
    })
  })
})

