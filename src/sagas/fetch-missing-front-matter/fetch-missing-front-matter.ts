import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { FetchFrontMatter } from './fetch-front-matter'
import { updateWork } from './update-work'
import { Api } from '../../api'
import { Saga } from '../../invoke'
import { Work } from '../../resources/work'

const ONE_DAY = 24 * 60 * 60 * 1000

const selectOneWorkToUpdate = (works: ReadonlyArray<Work>) => pipe(
  works,
  RA.filter((work) => (
    work.attributes.reason !== 'response-unavailable' ||
    (work.attributes.updatedAt.getTime() - new Date().getTime()) > ONE_DAY
  )),
  RA.head,
)

export const fetchMissingFrontMatter = (fetchFrontMatter: FetchFrontMatter, api: Api): Saga => pipe(
  api.fetchWorksAwaitingFrontMatter(),
  TE.map(selectOneWorkToUpdate),
  TE.chain(O.match(
    () => TE.right(null),
    updateWork(fetchFrontMatter, api),
  )),
)

