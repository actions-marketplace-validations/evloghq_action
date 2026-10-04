import { spawnSync } from 'node:child_process'

/**
 * How `npx` is told which CLI to run: a version goes on the package name, a
 * URL or a path is a spec of its own (a pkg.pr.new preview, for example).
 */
export function packageSpec(version) {
  return /^(https?:|file:|\.|\/)/.test(version) || version.includes('/') ? version : `@evlog/cli@${version}`
}

/**
 * Run one `evlog map` and hand back what it printed and how it exited.
 *
 * stdout is the machine contract (`--json` or workflow commands) and is
 * returned; stderr is the human report and is passed straight through so the
 * job log reads like a local run.
 */
export function runMap({ spec, cwd, args, env = process.env }) {
  const result = spawnSync('npx', ['--yes', '-p', spec, 'evlog', 'map', '--no-write', '--no-header', ...args], {
    cwd,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.error) throw result.error
  return { stdout: result.stdout, status: result.status ?? 1 }
}

/** The arguments shared by the JSON and the annotation runs of one package. */
export function gateArgs({ minScore, baseline }) {
  const args = []
  if (minScore !== undefined) args.push('--min-score', String(minScore))
  if (baseline) args.push('--baseline', baseline)
  return args
}
