import axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { FatalError } from '../invoke'

type Comment = {
  entryId: string,
  content: string,
}

export const createComment = (comment: Comment): TE.TaskEither<FatalError, null> => {
  const url = 'http://commands:44001/comments'
  return pipe(
    TE.tryCatch(
      async () => axios.post(url, { data: comment }, {
        headers: { 'Content-Type': 'application/json' },
      }),
      (error) => ({
        message: 'failed to create comment',
        payload: { url, comment, error },
      }),
    ),
    TE.map(() => null),
  )
}

