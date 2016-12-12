'use strict'
import xtend    from 'xtend'

function helper (worker) {
    return function (method, params, _opt) {
        worker.postMessage(xtend(_opt, {
            method: method
          , params: params
        }))
    }
}

export default helper
