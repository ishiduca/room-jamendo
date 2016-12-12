'use strict'

module.exports = Observer

function Observer () {
    this.subs = []
}

Observer.prototype.publish = function () {
    var isPublished = false
    var args = [].slice.apply(arguments)
    this.subs.forEach(function (sub) {
        sub.apply(null, args)
        isPublished = true
    })
    return isPublished
}

Observer.prototype.subscribe = function (sub) {
    if (isFunk(sub)) this.subs.push(sub)
    return sub
}

Observer.prototype.unSubscribe = function (sub) {
    if (! sub) this.subs = []
    this.subs = this.subs.filter(function (s) { return s !== sub})
    return sub
}

Observer.prototype.once = function (sub) {
    var me = this
    this.subscribe(wrap)
    return wrap

    function wrap () {
        sub.apply(null, arguments)
        me.unSubscribe(wrap)
    }
}

function isFunk (f) {return typeof f === 'function'}
