'use strict'
const xtend     = require('xtend')
const through   = require('through2')

module.exports = Playlist

const storageMaxLength = 60

function Playlist (storage, opt) {
    if (!(this instanceof Playlist)) return new Playlist(storage, opt)
    this.storage = storage
    this.storageMaxLength = xtend(opt).storageMaxLength || storageMaxLength
}

Playlist.prototype.addTrack = function (track) {
    return new Promise((resolve, reject) => {
        var tracks = []

        track.modified = Date.now()

        const put = () => {
            this.storage.put(track.id, track, err => {
                if (err) reject(err)
                else resolve(track)
            })
        }

        const slice = tracks => {
            var first = tracks[0]
            for (var i = 0; i < tracks.length; i += 1) {
                if (first.modified > tracks[i].modified) first = tracks[i]
            }

            this.storage.del(first.id, err => {
                if (err) return reject(err)

                tracks = tracks.filter(t => {return t.id !== first.id})
                if (tracks.length >= this.storageMaxLength)
                    slice(tracks)
                else
                    put()
            })
        }

        this.storage.createValueStream().once('error', reject)
        .pipe(through.obj((track, _, done) => {
            tracks.push(track)
            done()
        }, done => {
            if (tracks.length >= this.storageMaxLength) slice(tracks)
            else put()
            done()
        }))
    })
}

Playlist.prototype.removeTrack = function (_track) {
    return new Promise((resolve, reject) => {
        const id = _track.id
        this.storage.get(id, (err, track) => {
            if (err && ! err.notFound) return reject(err)
            this.storage.del(id, err => {
                if (err && ! err.notFound) reject(err)
                else resolve(track)
            })
        })
    })
}

Playlist.prototype.getAllTracks = function () {
    return new Promise((resolve, reject) => {
        const tracks = []
        this.storage.createValueStream().once('error', reject)
        .pipe(through.obj((track, _, done) => {
            tracks.push(track)
            done()
        }, done => {
            resolve(tracks.sort(sort))
            done()
        }))
    })

    function sort (A, B) {
        const a = A.modified
        const b = B.modified
        return (a > b) ? 1 : (a < b) ? -1 : 0
    }
}

Playlist.prototype.findTrack = function (track) {
    return new Promise((resolve, reject) => {
        this.storage.get(track.id, (err, _track) => {
            if (err && ! err.notFound) return reject(err)
            if (! _track)  return resolve(track)
            ;(_track._isInterested = true) && resolve(_track)
        })
//        const stream = this.storage.createValueStream().once('error', reject)
//
//        stream.pipe(through.obj((_track, _, done) => {
//            if (track.id === _track.id) {
//                _track._isInterested = true
//                resolve(_track)
//                stream.destroy()
//            }
//            done()
//        }, done => {
//            delete track._isInterested
//            resolve(track)
//            done()
//        }))
    })
}
