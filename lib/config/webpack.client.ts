import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import AssetsPlugin from 'assets-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { BuildConfig, CreateWebpackConfig, getAssetsFile } from '../runtime/server'
import { updateAssetLocations } from '../runtime/server/assets'
import { getTypeScriptWebpackRule } from './ts-loader-config'

interface EntryPoints {
    [name: string]: string[]
}

const getPlugins = (buildConfig: BuildConfig) => [
    new AssetsPlugin({
        filename: path.relative(process.cwd(), getAssetsFile(buildConfig.OUTPUT)),
        processOutput: assets => {
            updateAssetLocations(assets)
            return JSON.stringify(assets)
        },
    }),
]
/**
 * Base webpack config for the client that is used both in development and production
 * - Compile SCSS to CSS and extract into external assets
 * - Create assets.json that maps the created assets to their locations
 */
const clientBaseConfig: CreateWebpackConfig = options => {
    const {
        CLIENT_ENTRY,
        OUTPUT,
        CLIENT_POLYFILLS,
        PUBLIC_PATH,
        SERVER_PUBLIC_DIR,
    } = options.buildConfig

    let mainEntry = [CLIENT_ENTRY]
    /*
        https://github.com/webpack/webpack/issues/6647
        You should not have a entrypoint for vendor. It's not an entry.
        If you want to run two modules in order at an entrypoint, use an array.
    */
    if (CLIENT_POLYFILLS && fs.existsSync(CLIENT_POLYFILLS)) {
        mainEntry = [CLIENT_POLYFILLS, CLIENT_ENTRY]
    }

    const entry: EntryPoints = {
        main: mainEntry,
    }

    const plugins = getPlugins(options.buildConfig)
    const resolvePlugins: webpack.ResolvePlugin[] = []

    if (SERVER_PUBLIC_DIR) {
        const indexHtml = path.resolve(SERVER_PUBLIC_DIR, 'index.html')

        if (fs.existsSync(indexHtml)) {
            plugins.push(
                new HtmlWebpackPlugin({
                    inject: true,
                    template: indexHtml,
                }),
            )
        }
    }

    return {
        entry,
        module: {
            rules: [getTypeScriptWebpackRule(plugins, resolvePlugins, options, 'client')],
        },
        output: {
            path: OUTPUT,
            publicPath: PUBLIC_PATH,
        },
        plugins,
        resolve: {
            plugins: resolvePlugins,
        },
    }
}

export default clientBaseConfig
