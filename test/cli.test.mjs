import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { gateArgs, packageSpec } from '../src/lib/cli.mjs'

describe('packageSpec', () => {
  it('puts a version on the package name', () => {
    assert.equal(packageSpec('latest'), '@evlog/cli@latest')
    assert.equal(packageSpec('0.8.0'), '@evlog/cli@0.8.0')
  })

  it('passes a URL or a path through as the spec', () => {
    assert.equal(packageSpec('https://pkg.pr.new/@evlog/cli@767'), 'https://pkg.pr.new/@evlog/cli@767')
    assert.equal(packageSpec('../cli'), '../cli')
    assert.equal(packageSpec('file:./cli.tgz'), 'file:./cli.tgz')
  })
})

describe('gateArgs', () => {
  it('is empty with no gate', () => {
    assert.deepEqual(gateArgs({}), [])
  })

  it('carries both gates', () => {
    assert.deepEqual(gateArgs({ minScore: 80, baseline: '/tmp/base.json' }), ['--min-score', '80', '--baseline', '/tmp/base.json'])
  })

  it('keeps a zero threshold', () => {
    assert.deepEqual(gateArgs({ minScore: 0 }), ['--min-score', '0'])
  })
})
