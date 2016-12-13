'use strict'
var Observer  = require('./lib/observer')
var semaphore = require('./lib/semaphore')

module.exports = setup

function setup (worker, actions, stores) {
    var dispatcher = new Observer
    var sem        = semaphore(1)

    actions.forEach(function (act) {
        act.observer.subscribe(function wait (payload) {
            sem.wait(function () {
                dispatcher.publish(payload)
            })
        })

        act.errors.subscribe(onError)
    })

    dispatcher.subscribe(function (payload) {
        stores.forEach(function (store) {
            store.post(payload)
        })
    })

    stores.forEach(function (store) {
        store.observer.subscribe(function (state) {
            worker.postMessage(state)
            sem.signal()
        })
        store.errors.subscribe(function (err) {
            onError(err)
            sem.signal()
        })
    })

    worker.addEventListener('message', function (ev) {
        actions.forEach(function (act) {
            act.post(ev.data)
        })
    })

    function onError (err) {
        console.error(err)
    }
}
