// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FrontMatterFound = {
  type: 'found',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

