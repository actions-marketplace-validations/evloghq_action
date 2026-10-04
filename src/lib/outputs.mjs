import { appendFileSync } from 'node:fs'

/**
 * Fold the package results into the action's outputs.
 *
 * `score` and `delta` are the lowest across packages: that is the number the
 * gate looked at. Counts are summed. `results` carries everything.
 */
export function aggregate(results) {
  const withBaseline = results.filter(result => result.baseline)
  return {
    score: Math.min(...results.map(result => result.score)),
    delta: withBaseline.length > 0 ? Math.min(...withBaseline.map(result => result.baseline.delta)) : '',
    regressions: withBaseline.reduce((sum, result) => sum + result.baseline.regressions.length, 0),
    instrumented: results.reduce((sum, result) => sum + result.summary.instrumented, 0),
    partial: results.reduce((sum, result) => sum + result.summary.partial, 0),
    dark: results.reduce((sum, result) => sum + result.summary.dark, 0),
    passed: results.every(result => result.status === 'passed'),
    results: results.map(result => ({
      name: result.name,
      framework: result.framework,
      projectName: result.projectName,
      score: result.score,
      status: result.status,
      reasons: result.reasons,
      summary: result.summary,
      delta: result.baseline?.delta,
      regressions: result.baseline?.regressions ?? [],
      fixed: result.baseline?.fixed ?? [],
    })),
  }
}

/** `$GITHUB_OUTPUT` lines; a multi-line or JSON value goes through a heredoc. */
export function formatOutputs(outputs) {
  return Object.entries(outputs).map(([key, value]) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value)
    if (!text.includes('\n') && !text.startsWith('{') && !text.startsWith('[')) return `${key}=${text}`
    const delimiter = `EOF_${key}_${Math.random().toString(36).slice(2)}`
    return `${key}<<${delimiter}\n${text}\n${delimiter}`
  }).join('\n') + '\n'
}

export function writeOutputs(outputs, file) {
  if (file) appendFileSync(file, formatOutputs(outputs))
}
