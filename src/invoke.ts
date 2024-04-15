import * as TE from 'fp-ts/TaskEither'

export type FatalError = {
  message: string,
  payload: Record<string, unknown>,
}

export type Saga = TE.TaskEither<FatalError, null>

