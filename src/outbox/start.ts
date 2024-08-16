import { END, EventStoreDBClient, excludeSystemEvents } from '@eventstore/db-client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const propagate = (event: unknown): void => {
}

export const start = (): void => {
  const client = EventStoreDBClient.connectionString('esdb://eventstore:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000')
  const subscription = client.subscribeToAll({
    fromPosition: END,
    filter: excludeSystemEvents(),
  })

  subscription.on('data', (resolvedEvent) => {
    const event = resolvedEvent.event
    if (!event)
      return
    propagate(event)
  })
}

