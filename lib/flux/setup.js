'use strict'
var Observer = require('./lib/observer')

module.exports = setup

function setup (worker, actions, stores) {
    const dispatcher = new Observer

    actions.forEach(act => {
        act.observer.subscribe(payload => {
            dispatcher.publish(payload)
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
        })
        store.errors.subscribe(err => {
            console.log(err)
        })
    })

    worker.addEventListener('message', ev => {
        actions.forEach(act => {
            act.post(ev.data)
        })
    })
}
