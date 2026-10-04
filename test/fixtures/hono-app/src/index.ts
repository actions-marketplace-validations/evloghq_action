import { Hono } from 'hono'
import { evlog } from 'evlog/hono'

const app = new Hono()
app.use(evlog())

app.get('/items/:id', (c) => {
  const log = c.get('log')
  log.set({ item: { id: c.req.param('id') } })
  return c.json({ id: c.req.param('id') })
})

app.get('/health', c => c.json({ ok: true }))

export default app
