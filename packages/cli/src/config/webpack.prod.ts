import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import { CreateWebpackConfig } from '.'

/** Webpack settings for all production builds */
export const prodConfig: CreateWebpackConfig = () => ({
    devtool: 'source-map',
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                extractComments: false,
                terserOptions: {
                    compress: {},
                    ie8: false,
                },
            }),
        ],
        splitChunks: {
            chunks: 'all',
            hidePathInfo: true,
        },
    },
    plugins: [
        //new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
        new webpack.optimize.AggressiveSplittingPlugin(),
    ],
})
