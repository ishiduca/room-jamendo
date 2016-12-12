'use strict'
const path      = require('path')
const through   = require('through2')
const isPromise = require('is-promise')
const levelup   = require('levelup')
const Playlist  = require('playlist')

module.exports = websocketHandler

const ROOM      = '/jamendo/room'
const dbPath    = path.join(__dirname, '../dbs/', ROOM)
const storage   = levelup(dbPath, {valueEncoding: 'json'})
const playlist  = new Playlist(storage, {storageMaxLength: 60})
var   streams   = []

function websocketHandler (stream) {
    streams.push(stream)

    stream.once('close', () => {
        streams = streams.filter(s => {return s !== stream})
        console.log('some stream closed. [length: %s]', streams.length)
    })

    stream.on('error', console.error.bind(console))
    stream.pipe(through((buf, _, done) => {
        const reqStr = String(buf)
        var request; try {
            request = JSON.parse(reqStr)
        } catch (_err) {
            console.log('!! JSON.parse error')
            console.log('data: "%s"', reqStr)
            return done()
        }

        console.log('--> Request:')
        console.dir(request)

        const promise = helper(request)
        if (isPromise(promise)) {
            promise.then(value => {
                const payload = {
                    label:  request.label
                  , method: request.method
                  , params: {value: value}
                }
                const response  = JSON.stringify(payload)

                request.doBroadcast
                    ? broadcast(response)
                    : stream.write(response)

                console.log('<-- Response:')
                console.dir(payload)
            })
            .catch(err => console.error(err))
        }

        done()
    }))

    console.log('some stream connected. [length: %s]', streams.length)
}

function broadcast (str) {
    streams.forEach(stream => stream.write(str))
}

function helper (payload) {
    const method = payload.method
    if (typeof playlist[method] === 'function')
            return playlist[method](payload.params)
}
