import express from 'express'
import { evlog } from 'evlog/express'

const app = express()
app.use(evlog())

app.post('/orders', (req, res) => {
  req.log.set({ user: { id: req.body.userId }, order: { total: req.body.total } })
  req.log.audit({ action: 'order.placed', actor: { type: 'user', id: req.body.userId } })
  res.json({ ok: true })
})

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

export default app
