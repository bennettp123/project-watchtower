import path from 'path'
import { consoleLogger, noopLogger } from 'typescript-log'
import { getWebpackConfig } from '@project-watchtower/cli'
import { getBuildConfig } from '@project-watchtower/server'

const log = consoleLogger()
const root = path.resolve(process.cwd(), 'test/test-project')
const buildConfig = getBuildConfig(log, root)

describe('build/build', () => {
    it('getWebpackConfig', () => {
        expect(getWebpackConfig(log, buildConfig, 'server', 'prod')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'client', 'prod')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'server', 'dev')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'client', 'dev')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'server', 'debug')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'client', 'debug')).toBeTruthy()
        expect(getWebpackConfig(noopLogger(), buildConfig, 'server', 'foo' as any)).toBeUndefined()
        expect(getWebpackConfig(noopLogger(), buildConfig, 'foo' as any, 'prod')).toBeUndefined()
    })
})
