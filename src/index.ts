const doNothing = async () => {
  console.log('Doing nothing')
}

void (async (): Promise<void> => {
  setInterval(async () => doNothing(), 307 * 1000)
})()

