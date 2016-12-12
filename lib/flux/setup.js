'use strict'
var Observer  = require('./lib/observer')
var semaphore = require('./lib/semaphore')

module.exports = setup

function setup (worker, actions, stores) {
    var dispatcher = new Observer
    var sem        = semaphore(1)

    actions.forEach(act => {
        act.observer.subscribe(payload => {
            sem.wait(() => {
                dispatcher.publish(payload)
            })
        })

        act.errors.subscribe(err => {
            console.error(err)
        })
    })

    dispatcher.subscribe(payload => {
        stores.forEach(store => {
            store.post(payload)
        })
    })

    stores.forEach(store => {
        store.observer.subscribe(state => {
            worker.postMessage(state)
            sem.signal()
        })
        store.errors.subscribe(err => {
            console.error(err)
        })
    })

    worker.addEventListener('message', ev => {
        actions.forEach(act => {
            act.post(ev.data)
        })
    })
}
