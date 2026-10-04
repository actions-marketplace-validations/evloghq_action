import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { relabelBaseline } from '../src/lib/baseline.mjs'

describe('relabelBaseline', () => {
  it('replaces every mention of the temp file with the ref', () => {
    const text = '::error title=evlog map::score 56/100; regressed against /tmp/evlog-base-x/main/app.json\n'
    assert.equal(relabelBaseline(text, '/tmp/evlog-base-x/main/app.json', 'main'), '::error title=evlog map::score 56/100; regressed against main\n')
  })

  it('leaves the text alone when there is no baseline file', () => {
    assert.equal(relabelBaseline('x', undefined, 'main'), 'x')
  })
})
