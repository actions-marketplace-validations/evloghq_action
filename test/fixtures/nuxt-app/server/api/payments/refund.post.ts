export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  await $fetch('https://payments.example/refund', { method: 'POST', body })
  return { ok: true }
})
