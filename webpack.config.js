const Copy = require('copy-webpack-plugin')
const path = require('path')
const copy = new Copy([path.resolve(__dirname, 'gcp/appsscript.json')])
const conf = require('nyc-build-helper').config.defaultWebpackConfig(__dirname)
conf.plugins.push(copy)
module.exports = conf