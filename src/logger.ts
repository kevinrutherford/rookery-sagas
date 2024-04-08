import chalk from 'chalk'
import Logfmt from 'logfmt'

const logfmt = new Logfmt()

// TODO: decode process.env to this
// export type Level = 'debug' | 'info' | 'warn' | 'error'

const LEVELS: Record<string, number> = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
}

const COLORS: Record<string, chalk.Chalk> = {
  debug: chalk.grey,
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
}

interface Payload {
  error?: Error;
  message?: string;
  stack?: string;
}

type Formatter = (level: string, message: string, data: Payload) => string

const formatWithColour: Formatter = (level, message, data) => {
  const fmt = logfmt.stringify(data)
  let tag = `[${level}]`
  tag = `${COLORS[level](tag)}`
  return `${tag} ${message} ${chalk.hex('#ffc458')(fmt)}`
}

const formatVanilla: Formatter = (level, message, data) => (
  logfmt.stringify({ ...data, level, message })
)

type Emitter = (output: string) => void

export class Logger {

  private format: Formatter
  private threshold: number
  private emit: Emitter

  constructor(emit: Emitter, format: Formatter, level: string) {
    this.emit = emit
    this.format = format
    this.threshold = LEVELS[level]      // TODO: risky
  }

  debug(message: string | Error, data = {}): void {
    this.log('debug', message, data)
  }

  error(message: string | Error, data = {}): void {
    this.log('error', message, data)
  }

  info(message: string | Error, data = {}): void {
    this.log('info', message, data)
  }

  warn(message: string | Error, data = {}): void {
    this.log('warn', message, data)
  }

  private log(level: string, message: string | Error, data: Payload): void {
    if (LEVELS[level] < this.threshold)
      return
    if (typeof data !== 'object')
      data = {}
    if (message instanceof Error) {
      data.error = message
      data.stack = message.stack
      message = message.message
    }
    const fmt = this.format(level, message, data)
    this.emit(`${new Date().toISOString()} ${fmt}\n`)
  }

}

type Config = {
  emit: Emitter,
  colour: boolean,
  level: string,
}

const create = (opts: Config): Logger => (
  new Logger(
    opts.emit,
    opts.colour ? formatWithColour : formatVanilla,
    opts.level,
  )
)

export { Config, create }

