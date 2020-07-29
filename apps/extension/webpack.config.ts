import * as CopyPlugin from 'copy-webpack-plugin';
import { resolve } from 'path';
import { Configuration } from 'webpack';

const WebpackShellPlugin = require('webpack-shell-plugin-next');

const config: Configuration = {
    entry: {
        'content-script': resolve(__dirname, './src/content-script.ts')
    },

    output: {
        path: resolve(__dirname, './dist'),
        filename: '[name].js'
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader']
            }
        ]
    },

    target: 'web',

    resolve: {
        modules: ['node_modules'],
        extensions: [
            '.ts',
            '.js'
        ]
    },

    plugins: [
        new CopyPlugin([
            {
                from: './src/manifest.json',
                to: './manifest.json'
            },
            {
                from: './src/icons/*.png',
                flatten: true,
                to: './icons/'
            }
        ]),
        new WebpackShellPlugin({
            onBuildStart: {
                scripts: ['npm run updateAll'],
                blocking: true
            }
        })
    ],

    mode: 'production'
};

export = config;
