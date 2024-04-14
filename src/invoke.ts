import * as TE from 'fp-ts/TaskEither'

type FatalError = {
  message: string,
  payload: Record<string, unknown>,
}

export type Saga = TE.TaskEither<FatalError, void>

