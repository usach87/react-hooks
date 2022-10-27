const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const distPath = path.resolve(process.cwd(), 'dist');

function webpackConfig(entry) {
  return {
    entry,
    output: {
      path: distPath,
      filename: '[name].js',
      library: '[name]',
      libraryTarget: 'umd',
      publicPath: '../src',
      umdNamedDefine: true,
      environment: {
        arrowFunction: false,
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: "tsconfig.build.json"
              }
            }
          ],
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserJSPlugin({ extractComments: false }),
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    externals: [
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react'
      },
        reactDom: {
          root: 'ReactDOM',
          commonjs2: 'react-dom',
          commonjs: 'react-dom',
          amd: 'react-dom'
        },
      },
    ],
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: path.resolve(process.cwd(), 'package.json'), to: distPath },
        ],
      }),
    ],
    target: 'node',
    mode: 'production',
    stats: 'errors-warnings',
  }
}

module.exports = webpackConfig;
