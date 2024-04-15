type FrontMatterFound = {
  type: 'found',
  title: string,
  abstract: string,
  authors: Array<string>,
}

type FrontMatterNotFound = {
  type: 'not-found',
}

type FrontMatterUnavailable = {
  type: 'response-unavailable',
  details: string,
}

type FrontMatterInvalid = {
  type: 'response-invalid',
  details: string,
}

export type FrontMatterResponse =
  | FrontMatterUnavailable
  | FrontMatterInvalid
  | FrontMatterNotFound
  | FrontMatterFound

