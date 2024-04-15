import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { updateWork } from './update-work'
import * as api from '../api'
import { Saga } from '../invoke'
import * as L from '../logger'

export const fetchMissingFrontMatter = (logger: L.Logger): Saga => pipe(
  api.fetchWorksAwaitingFrontMatter(),
  TE.map(RA.head),
  TE.chain(O.match(
    () => TE.right(null),
    updateWork(logger),
  )),
)

