import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import opn from 'opn'
import { getWebpackConfig } from '../build/build'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'
import * as AssetsPlugin from 'assets-webpack-plugin'

export type HotReloadMiddleware = (
    log: Logger,
    buildConfig: BuildConfig,
) => express.RequestHandler[]

export const getHotReloadMiddleware: HotReloadMiddleware = (log, buildConfig) => {
    const config = getWebpackConfig(log, buildConfig, 'client', 'dev')
    if (!config) {
        throw new Error('Unable to load webpack config')
    }

    if (config.plugins) {
        config.plugins = config.plugins.filter(plugin => !(plugin instanceof AssetsPlugin))
    }
    const compiler = webpack(config)

    const dev = webpackDevMiddleware(compiler, {
        publicPath: buildConfig.PUBLIC_PATH,
        noInfo: true,
        // do not serve index.html on / route
        // https://github.com/webpack/webpack-dev-middleware/issues/153
        index: 'foobar',
        stats: 'errors-only',
    })

    const hot = webpackHotMiddleware(compiler)

    return [dev, hot]
}

export const openBrowser = (port: number) => {
    if (process.env.NODE_ENV === 'test') {
        return
    }

    opn(`http://localhost:${port}`)
}
