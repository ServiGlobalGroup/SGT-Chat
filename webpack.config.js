const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = (process.env.NODE_ENV || 'development') !== 'production';

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    // Evitar limpiar en caliente para no interferir con peticiones simultáneas
    clean: !isDev,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'SGT Chat',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    // Sirve sólo recursos estáticos (favicon, etc.) desde public en desarrollo
    static: {
      directory: path.join(__dirname, 'public'),
      watch: true,
    },
    port: 3000,
    hot: true,
    open: false,
    devMiddleware: {
      writeToDisk: false,
    },
  },
  target: 'electron-renderer',
};
