var _ = require('lodash');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var extend = require('util')._extend;
var os = require('os');
var path = require('path');
var MemoryFS = require('memory-fs');
var fs = new MemoryFS();
var TMP_PATH = os.tmpdir();

var renderer = function(data, options, callback) {
  var hexo = this;
  var userConfig = extend(
    hexo.config.webpack || {}
  );
  var cwd = process.cwd();
  //
  // Convert config of the entry to object.
  //
  var entry = (function(entry) {
    if (_.isString(entry)) entry = [entry];

    return entry
      .filter(function(n){
        return _.includes(n, 'source')
      })
      .map(function(n){
        return path.join(cwd, n)
      });
  })(userConfig.entry);
  //
  // If this file is not a webpack entry simply return the file.
  //
  if (entry.length === 0) {
    return callback(null, data.text);
  }
  //
  // Copy config then extend it with some defaults.
  //
  var config = extend({}, userConfig);

  config.devtool = process.env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : 'eval';
  config = extend(config, {
    entry: data.path,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/transform-runtime']
            }
          }
        }
      ]
    },
    output: {
      path: TMP_PATH,
      filename: path.basename(data.path)
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV === 'development' ? 'development' : 'production')
      }),
      new UglifyJSPlugin()
    ]
  });
  //
  // Setup compiler to use in-memory file system then run it.
  //
  var compiler = webpack(config);
  compiler.outputFileSystem = fs;
  compiler.run(function(err, stats) {
    var output = compiler.options.output;
    var outputPath = path.join(output.path, output.filename);

    if (stats.toJson().errors.length > 0) {
      hexo.log.log(stats.toString());
      return callback(stats.toJson().errors, 'Webpack Error.');
    }

    contents = fs.readFileSync(outputPath).toString();

    // Fix problems with HTML beautification
    // see: https://github.com/hexojs/hexo/issues/1663
    contents = contents
      .replace(/</g, ' < ')
      .replace(/< </g, ' << ');

    return callback(null, contents);
  });

};

module.exports = renderer;