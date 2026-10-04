/**
 * One comment per pull request, edited in place on every run.
 *
 * The marker is how the comment is found again; the key lets two workflows
 * (or two matrix legs) keep separate comments.
 */
export function marker(key) {
  return `<!-- evlog-action:${key} -->`
}

async function request(fetchFn, url, token, init = {}) {
  const response = await fetchFn(url, {
    ...init,
    headers: {
      'accept': 'application/vnd.github+json',
      'authorization': `Bearer ${token}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
      ...init.headers,
    },
  })
  return response
}

/**
 * Create or update the comment. Returns what happened so the caller can say
 * so; a token that cannot write (a fork, read-only workflow permissions) is
 * reported, not thrown: the annotations and the summary still stand.
 */
export async function upsertComment({ event, token, key, body, fetchFn = fetch }) {
  const { apiUrl, repository, pullRequest } = event
  if (!pullRequest) return { outcome: 'skipped', reason: 'not a pull request' }
  if (!token) return { outcome: 'skipped', reason: 'no token' }
  const tag = marker(key)
  const content = `${tag}\n${body}`
  const base = `${apiUrl}/repos/${repository}/issues/${pullRequest.number}/comments`

  const list = await request(fetchFn, `${base}?per_page=100`, token)
  if (list.status === 401 || list.status === 403) return { outcome: 'skipped', reason: `token cannot read comments (${list.status})` }
  if (!list.ok) return { outcome: 'failed', reason: `listing comments: ${list.status}` }
  const existing = (await list.json()).find(comment => typeof comment.body === 'string' && comment.body.startsWith(tag))

  const response = existing
    ? await request(fetchFn, `${apiUrl}/repos/${repository}/issues/comments/${existing.id}`, token, { method: 'PATCH', body: JSON.stringify({ body: content }) })
    : await request(fetchFn, base, token, { method: 'POST', body: JSON.stringify({ body: content }) })
  if (response.status === 401 || response.status === 403) {
    return { outcome: 'skipped', reason: 'token cannot write pull request comments; grant `pull-requests: write` or set `comment: false`' }
  }
  if (!response.ok) return { outcome: 'failed', reason: `${existing ? 'updating' : 'creating'} comment: ${response.status}` }
  return { outcome: existing ? 'updated' : 'created', id: (await response.json()).id }
}
