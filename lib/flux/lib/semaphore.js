'use strict'
module.exports = Semaphore

function Semaphore (_capacity) {
    if (!(this instanceof Semaphore)) return new Semaphore(_capacity)
    this.capacity = _capacity || 1
    this.current  = 0
    this.queue    = []
}

Semaphore.prototype.wait = function (sub) {
    if (this.current < this.capacity) sub()
    else this.queue.push(sub)
    this.current += 1
}

Semaphore.prototype.signal = function () {
    if (this.current >= 0) {
        if (typeof this.queue[0] === 'function') this.queue.shift()()
        this.current -= 1
    }
}
