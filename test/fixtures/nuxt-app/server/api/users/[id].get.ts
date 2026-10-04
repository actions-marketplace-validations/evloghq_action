export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const id = getRouterParam(event, 'id')
  log.set({ user: { id } })
  return { id }
})
