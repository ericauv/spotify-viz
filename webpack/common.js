require('dotenv').config()

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: [
    'regenerator-runtime',
    './client/index.js',
    './client/sass/main.scss'
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins:['@babel/plugin-proposal-class-properties']
          },
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
        {
    test: /\.(png|svg|jpg|gif)$/,
    use: [
      'file-loader',
    ],
  },
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'app.min.css',
    }),
    new HtmlWebpackPlugin({
      template: './client/index.html'
    }),
    new ScriptExtHtmlWebpackPlugin(),
    new webpack.DefinePlugin({
      PROJECT_ROOT: JSON.stringify(process.env.PROJECT_ROOT)
    })
  ],
  resolve: {
    modules: [
      'node_modules',
      'client',
      'assets'
    ],
    extensions: ['.js', '.css', '.scss', '.sass', '.gif', 'jpg']
  }
}
