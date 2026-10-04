export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const body = await readBody(event)
  log.set({ user: { id: body.userId }, cart: { items: body.items.length } })
  log.audit({ action: 'checkout.completed', actor: { type: 'user', id: body.userId } })
  return { ok: true }
})
