import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import clientBaseConfig from './webpack.client.base'

const config = merge(clientBaseConfig, {
    output: {
        filename: '[name]_[chunkhash].js',
        chunkFilename: '[name]_[chunkhash].js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false,
            },
            mangle: {
                screw_ie8: true,
            },
            sourceMap: true,
        }),
    ],
})

export default config
