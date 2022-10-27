const path = require('path');
const webpack = require('webpack');
const rimraf = require('rimraf');

const { getAllEntry } = require('./utils');
const webpackConfig = require('./webpack');

function build() {
  rimraf.sync('./dist');

  const srcEntry = './src/hooks';
  const srcPath = path.resolve(process.cwd(), srcEntry);

  return new Promise((resolve, reject) => {
    getAllEntry(srcPath, srcEntry).then((entry) => {
      console.log('entriesList', entry)
      const compiler = webpack([
        webpackConfig(entry)
      ]);

      compiler.run((err, stats) => {
        process.stdout.write(stats.toString({
          chunks: false,
          colors: true,
        }) + '\n');

        console.log(stats.stats[0].compilation.errors);

        if (err || !stats) {
          reject(err);
        } else {
          resolve(entry);
        }
      });
    }, () => {
      reject();
    });
  });
}

build();
