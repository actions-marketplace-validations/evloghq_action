import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

/**
 * Expand the `packages` input into package directories.
 *
 * A pattern is a path whose segments may be `*`; each `*` matches the entries
 * of one directory. A match counts when it holds a `package.json`, so
 * `apps/*` skips a stray `apps/README.md`. Explicit paths are kept as written,
 * and the caller gets the same error a user would understand: the directory
 * is not a package.
 */
export function expandPackages(patterns, root) {
  const found = new Set()
  for (const pattern of patterns) {
    const matches = pattern.includes('*') ? expand(pattern.split('/'), root).filter(isPackage) : [resolve(root, pattern)]
    for (const dir of matches) found.add(dir)
  }
  return [...found].sort().map(dir => ({ dir, name: toPosix(relative(root, dir)) || '.' }))
}

function expand(segments, base) {
  const [head, ...rest] = segments
  if (head === undefined) return [base]
  if (head === '') return expand(rest, base)
  if (!head.includes('*')) return expand(rest, join(base, head))
  if (!existsSync(base) || !statSync(base).isDirectory()) return []
  const matcher = new RegExp(`^${head.split('*').map(escape).join('.*')}$`)
  return readdirSync(base)
    .filter(entry => matcher.test(entry) && !entry.startsWith('.') && entry !== 'node_modules')
    .map(entry => join(base, entry))
    .filter(path => statSync(path).isDirectory())
    .flatMap(path => expand(rest, path))
}

const escape = text => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

export function isPackage(dir) {
  return existsSync(join(dir, 'package.json'))
}

export const toPosix = path => path.split(sep).join('/')
