const path = require('path');

module.exports = {
  entry: {
    index: './src/index.ts',
    storage: './src/storage.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'origin-storage': path.resolve(__dirname, '..'),
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    port: 9000,
    host: '0.0.0.0',
  },
};
