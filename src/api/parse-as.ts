import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import { FatalError } from '../invoke'

export const parseAs = <R>(codec: t.Decoder<unknown, R>) => (response: unknown): E.Either<FatalError, R> => pipe(
  response,
  codec.decode,
  E.mapLeft((errors) => ({
    message: 'invalid response',
    payload: { errors: formatValidationErrors(errors) },
  })),
)

