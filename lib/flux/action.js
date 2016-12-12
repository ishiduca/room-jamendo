'use stiect'
var xtend    = require('xtend')
var Observer = require('./lib/observer')

module.exports = Action

function Action () {
    this.observer = new Observer
    this.errors   = new Observer
}

Action.prototype.post = function (payload) {
    var method = payload.method
    if (typeof this[method] === 'function') {
        this[method](payload.params)
    }
}
