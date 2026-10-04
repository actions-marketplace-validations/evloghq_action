import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { aggregate, formatOutputs } from '../src/lib/outputs.mjs'

const result = (overrides = {}) => ({
  name: '.', path: '.', framework: 'nuxt', projectName: 'shop', score: 82, status: 'passed', reasons: [],
  summary: { instrumented: 3, partial: 1, dark: 1, exempt: 0 }, routes: [], baseline: undefined, ...overrides,
})

describe('aggregate', () => {
  it('takes the lowest score and delta, sums the counts', () => {
    const outputs = aggregate([
      result({ baseline: { delta: 4, regressions: [], fixed: [] } }),
      result({ name: 'apps/api', score: 61, status: 'failed', reasons: ['regressed'], summary: { instrumented: 1, partial: 0, dark: 4, exempt: 0 }, baseline: { delta: -9, regressions: [{ check: 'audit' }], fixed: [] } }),
    ])
    assert.equal(outputs.score, 61)
    assert.equal(outputs.delta, -9)
    assert.equal(outputs.regressions, 1)
    assert.equal(outputs.instrumented, 4)
    assert.equal(outputs.dark, 5)
    assert.equal(outputs.passed, false)
    assert.equal(outputs.results.length, 2)
    assert.equal(outputs.results[1].reasons[0], 'regressed')
  })

  it('leaves delta empty with no baseline anywhere', () => {
    const outputs = aggregate([result()])
    assert.equal(outputs.delta, '')
    assert.equal(outputs.regressions, 0)
    assert.equal(outputs.passed, true)
  })
})

describe('formatOutputs', () => {
  it('writes scalars as key=value and JSON through a heredoc', () => {
    const text = formatOutputs({ score: 82, delta: '', passed: true, results: [{ a: 1 }] })
    assert.match(text, /^score=82\n/)
    assert.match(text, /\ndelta=\n/)
    assert.match(text, /\npassed=true\n/)
    assert.match(text, /results<<EOF_results_\w+\n\[\{"a":1\}\]\nEOF_results_\w+\n$/)
  })
})
