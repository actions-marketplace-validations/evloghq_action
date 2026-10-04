import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { expandPackages } from '../src/lib/packages.mjs'

let root
before(() => {
  root = mkdtempSync(join(tmpdir(), 'evlog-action-packages-'))
  for (const dir of ['apps/web', 'apps/api', 'apps/.hidden', 'apps/node_modules/x', 'packages/core', 'tools']) {
    mkdirSync(join(root, dir), { recursive: true })
  }
  for (const pkg of ['apps/web', 'apps/api', 'apps/.hidden', 'apps/node_modules/x', 'packages/core']) {
    writeFileSync(join(root, pkg, 'package.json'), '{}')
  }
  writeFileSync(join(root, 'apps/README.md'), '')
})
after(() => rmSync(root, { recursive: true, force: true }))

describe('expandPackages', () => {
  it('expands a star to the packages of one directory, sorted', () => {
    assert.deepEqual(expandPackages(['apps/*'], root).map(pkg => pkg.name), ['apps/api', 'apps/web'])
  })

  it('skips files, dot-directories and node_modules', () => {
    const names = expandPackages(['apps/*'], root).map(pkg => pkg.name)
    assert.ok(!names.includes('apps/.hidden'))
    assert.ok(!names.includes('apps/node_modules'))
  })

  it('skips a directory with no package.json', () => {
    assert.deepEqual(expandPackages(['*'], root).map(pkg => pkg.name), [])
  })

  it('keeps an explicit path even when it is not a package, so the caller can say so', () => {
    assert.deepEqual(expandPackages(['tools'], root).map(pkg => pkg.name), ['tools'])
  })

  it('merges patterns and removes duplicates', () => {
    const names = expandPackages(['apps/*', 'apps/web', 'packages/*'], root).map(pkg => pkg.name)
    assert.deepEqual(names, ['apps/api', 'apps/web', 'packages/core'])
  })

  it('matches a partial star', () => {
    assert.deepEqual(expandPackages(['apps/w*'], root).map(pkg => pkg.name), ['apps/web'])
  })

  it('returns nothing for a directory that does not exist', () => {
    assert.deepEqual(expandPackages(['services/*'], root), [])
  })
})
