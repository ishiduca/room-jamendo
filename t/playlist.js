'use strict'
const test      = require('tape')
const Playlist  = require('playlist')
const levelup   = require('levelup')
const memdown   = require('memdown')
const dbPath    = __dirname + '/jamendo/room'
const storage   = levelup(dbPath, {
    db: memdown, valueEncoding: 'json'
})

test('const playlist = new Playlist(storage, {storageMaxLength: 5})', t => {
    const playlist  = new Playlist(storage, {storageMaxLength: 5})

    t.ok(playlist.getAllTracks, 'playlist.getAllTracks')
    t.end()
})

test('const promise = playlist.addTrack(track)', t => {
    const playlist  = new Playlist(storage, {storageMaxLength: 5})

    playlist.addTrack({id: '9999', name: 'first track'})
    .then(track => {
        t.is(track.id, '9999', 'track.id eq "9999"')
        t.is(track.name, 'first track', 'track.name eq "first track"')
        t.ok(Date.now() >= track.modified, `track.modifed eq "${track.modified}"`)

        playlist.storage.get(track.id, (err, _track) => {
            t.notOk(err, 'error not found')
            t.deepEqual(track, _track, JSON.stringify(track))
            t.end()
        })
    })
    .catch(err => console.error(err))
})

test('const promise = playlist.removeTrack(track)', t => {
    const playlist  = new Playlist(storage, {storageMaxLength: 5})

    playlist.addTrack({id: '9998', name: 'second track'})
    .then(track => {
        console.log('# addTrack({id: "9998", name: "second track"})')
        console.log('# ' + JSON.stringify(track))

        playlist.removeTrack({id: "9998"})
        .then(track => {
            t.is(track.id, '9998', 'track.id eq "9998"')
            t.is(track.name, 'second track', 'track.name eq "second track"')
            t.ok(Date.now() >= track.modified
                , `track.modifed eq "${track.modified}"`)

            playlist.storage.get(track.id, (err, _track) => {
                console.log('# playlist.storage.get(track.id, ...)')
                t.notOk(_track, '_track not found')
                t.ok(err.notFound, 'exists "err.notFound"')
                t.end()
            })
        })
        .catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

test('const promise = playlist.findTrack(track)', t => {
    const playlist  = new Playlist(storage, {storageMaxLength: 5})

    t.test('findTrack(first track)', tt => {
        playlist.findTrack({id: '9999'}).then(track => {
            tt.is(track.id, '9999', 'track.id eq "9999"')
            tt.is(track.name, 'first track', 'track.name eq "first track"')
            tt.ok(track.modified, `track.modified eq "${track.modified}"`)
            tt.is(track._isInterested, true, 'track._isInterested eq true')
            tt.end()
        })
    })

    t.test('findTrack(second track) # track not found', tt => {
        const _track = {id: '9998'}
        playlist.findTrack(_track).then(track => {
            t.is(track, _track, 'track deepEqual {id: "9998"}')
            tt.end()
        })
    })

    t.end()
})

test('const promise = playlist.getAllTracks()', t => {
    const playlist  = new Playlist(storage, {storageMaxLength: 5})
    const ids = ('876543210').split('').map(n => (`999${n}`))
    const promise = ids.reduce((p, id) => {
        return p.then(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(playlist.addTrack({
                        id: id, name: String(id).slice(-2)
                    }))
                }, 100)
            })
        })
    }, Promise.resolve())

    promise.then(w => {
        playlist.getAllTracks().then(tracks => {
            t.is(tracks.length, playlist.storageMaxLength, 'tracks.length eq playlist.storageMaxLength')
            const ids = tracks.map(t => t.id)
            const names = tracks.map(t => t.name)
            const modifieds = tracks.map(t => t.modified).sort((a,b) => (a > b ? 1 : a < b ? -1 : 0))
            t.deepEqual(ids, ['9994', '9993', '9992', '9991', '9990'], 'tracks ids deepEqual  ["9994", "9993", "9992", "9991", "9990"]')
            t.deepEqual(names, ["94", "93", "92", "91", "90"], 'tracks names deepEqual ["94", "93", "92", "91", "90"]')
            t.deepEqual(modifieds, tracks.map(t => t.modified))
            t.end()
        })
        .catch(console.error.bind(console))
    })
})


