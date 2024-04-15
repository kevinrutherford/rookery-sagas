import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { FetchFrontMatter } from './fetch-front-matter'
import { updateWork } from './update-work'
import { Api } from '../api'
import { Saga } from '../invoke'

export const fetchMissingFrontMatter = (fetchFrontMatter: FetchFrontMatter, api: Api): Saga => pipe(
  api.fetchWorksAwaitingFrontMatter(),
  TE.map(RA.head),
  TE.chain(O.match(
    () => TE.right(null),
    updateWork(fetchFrontMatter, api),
  )),
)

