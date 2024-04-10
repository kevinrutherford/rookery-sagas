type FrontMatterFound = {
  type: 'found',
}

type FrontMatterNotFound = {
  type: 'not-found',
}

type FrontMatterUnavailable = {
  type: 'unavailable',
  details: string,
}

type FrontMatterInvalid = {
  type: 'invalid',
  details: string,
}

export type FrontMatterResponse =
  | FrontMatterFound
  | FrontMatterNotFound
  | FrontMatterUnavailable
  | FrontMatterInvalid

