'use strict'
const test      = require('tape')
const Observer  = require('observer')

test('const observer = new Observer', t => {
    var o = new Observer
    var vals = [
        'abc', 'def', 'ghi'
    ]
    var spy  = []
    var once = []

    o.subscribe(a => {
        spy.push(a)
    })

    o.once(a => {
        once.push(a)
    })

    vals.forEach(v => {
        o.publish(v)
    })

    t.deepEqual(spy, vals)
    t.deepEqual(once, ['abc'])
    t.end()
})

test('obsever.publist(arg1, arg2, ...)', t => {
    var o = new Observer

    var spy  = []
    var once = []

    o.once(function () {
        once.push([].join.apply(arguments, ['']))
    })
    o.subscribe(function () {
        spy.push([].join.apply(arguments, ['']))
    })

    o.publish('abc', 'def', 'ghi')
    o.publish('ABC', 'DEF', 'GHI', 'JKL')

    t.deepEqual(once, ['abcdefghi'])
    t.deepEqual(spy, ['abcdefghi', "ABCDEFGHIJKL"])
    t.end()
})
