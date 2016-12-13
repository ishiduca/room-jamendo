var clone    = require('clone')
var xtend    = require('xtend')
var Observer = require('./lib/observer')

module.exports = Store

function Store (defaultState, children) {
    this.defaultState = clone(defaultState || {})
    this._state       = clone(defaultState || {})
    this.children     = Array.isArray(children) ? children : []
    this.observer     = new Observer
    this.errors       = new Observer
}

Store.prototype.getState = function (key) {
    return typeof key === 'string' ? clone(this._state[key]) : clone(this._state)
}

Store.prototype.setState = function (state) {
    this._state = xtend(this._state, state)
}

Store.prototype.post = function (payload) {
    var me = this
    var method = payload.method

    if (this.children && this.children.length) {
        var ps = this.children.map(function (child) {
            return new Promise(function (resolve, reject) {
                child.observer.once(resolve)
                child.errors.once(reject)
                child.post(payload)
            })
        })

        Promise.all(ps).then(function (states) {
            var state = states.filter(isObject).reduce(function (a, b) {
                return xtend(a, b)
            }, {})

            if (isFun(me[method])) me[method](payload.params, state)
            else me.observer.publish(state)
        })
        .catch(function (err) {
            me.errors.publish(err)
        })
    }

    else if (isFun(this[method])) this[method](payload.params)

    else this.observer.publish()
}

function isFun (f) {return typeof f === 'function'}
function isObject (o) {return Object.prototype.toString.apply(o) === '[object Object]'}
