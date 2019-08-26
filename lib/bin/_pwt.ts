import { fork } from 'child_process'
import path from 'path'

/**
 * Increaase UV_THREADPOOL_SIZE to prevent deadlock in SCSS compilation
 * https://github.com/webpack-contrib/sass-loader/issues/100
 */
process.env.UV_THREADPOOL_SIZE = '128'

const filePath = path.resolve(__dirname, 'index.js')

const env: NodeJS.ProcessEnv = {
    ...process.env,
}

// already set fast mode env variable here so that the server build also skips type checking
if (
    (process.argv.indexOf('watch') !== -1 && process.argv.indexOf('fast') !== -1) ||
    process.argv.indexOf('build') !== -1
) {
    env.START_FAST_MODE = 'true' // fast mode when building
}

const proc = fork(filePath, process.argv.slice(2), {
    env,
    execArgv: [
        ...process.execArgv,
        // Node runs out of memory when re-exporting the glamorous 4 typings
        // with TypeScript 2.4
        // https://github.com/Microsoft/TypeScript/issues/17070
        '--max-old-space-size=4096',
    ],
})

proc.on('error', () => {
    process.exit(1)
})

proc.on('exit', code => {
    process.exit(code || undefined)
})
