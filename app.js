'use strict'
const http          = require('http')
const path          = require('path')
const ecstatic      = require('ecstatic')(path.join(__dirname, 'static'))
const websocket     = require('websocket-stream')
const app           = http.createServer(ecstatic)
const PORT          = process.env.PORT || 9999

if (! module.parent) {
    app.listen(PORT, () => console.log(
      'server start to listen on port "%s"', app.address().port))
}

websocket.createServer({server: app}, require('websocket-handler'))

module.exports = app
