
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./emoji-picker-react.cjs.production.min.js')
} else {
  module.exports = require('./emoji-picker-react.cjs.development.js')
}
