import { arbitraryWord } from '../../../helpers'
import { toAbsoluteUrl } from '../../../src/sagas/activity-pub/to-absolute-url'
import { Config } from '../../../src/sagas/forward-outbox-activities/config'

describe('toAbsoluteUrl', () => {
  describe.each([
    ['subdomain.example.com'],
    ['subdomain.example.com/'],
    ['subdomain.example.com/api/'],
    ['localhost:44002'],
    ['localhost:44002/'],
  ])('given the ROOKERY_HOSTNAME "%s"', (hostname) => {
    const env: Config = {
      ROOKERY_HOSTNAME: hostname,
      USER_A1_ID: arbitraryWord(),
      USER_A2_ID: arbitraryWord(),
      USER_A3_ID: arbitraryWord(),
      USER_CRB_ID: arbitraryWord(),
    }

    describe.each([
      [arbitraryWord()],
      ['/' + arbitraryWord()],
    ])('and "%s" for the path', (path) => {
      const result = toAbsoluteUrl(env)(path)

      it('ends with the given path', () => {
        expect(result).toMatch(new RegExp(`.*${path}$`))
      })

      it('has exactly one / before the path', () => {
        expect(result).toMatch(/\//)
        expect(result).not.toMatch(/\/\//)
      })
    })
  })
})

