const fs = require('fs')
const path = require('path')
const css = fs.readFileSync(path.resolve(__dirname, 'dist/css/geocoding-sheet.css'), {encoding: 'utf-8'})
const polyfill = fs.readFileSync(path.resolve(__dirname, 'dist/js/babel-polyfill.js'), {encoding: 'utf-8'})
const js = fs.readFileSync(path.resolve(__dirname, 'dist/js/geocoding-sheet.js'), {encoding: 'utf-8'})
let html = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), {encoding: 'utf-8'})
html = html.replace(/\/\*style\*\//, css)
html = html.replace(/\/\*polyfill\*\//, polyfill)
html = html.replace(/\/\*script\*\//, js)
html = html.replace(/<!--version-->/, `<!--v${require('package').version}-->`)
fs.writeFileSync(path.resolve(__dirname, 'gcp/index.html'), html, {encoding: 'utf-8'})
fs.copyFileSync(path.resolve(__dirname, 'src/js/Code.js'), path.resolve(__dirname, 'gcp/Code.gs'))
