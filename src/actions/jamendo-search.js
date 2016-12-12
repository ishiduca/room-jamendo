'use strict'
import xtend    from 'xtend'
import through  from 'through2'
import Action   from '../../lib/flux/action'

class JamendoSearch extends Action {
    constructor (client, requestOption) {
        super()
        this.label         = 'Jamendo.Search'
        this.client        = client
        this.requestOption = requestOption
        this.websocket     = null
    }

    setWebsocket (websocket, readable) {
        this.websocket = websocket
        readable.on('data', response => {
            this.onFindTrack(response)
        })
    }

    find (data, _opt) {
        const q = {}; q[data.key] = data.val
        const query  = xtend(this.requestOption, _opt, q)
        const title  = data.key + ': ' + data.val
        const tracks = []

        this.client.request('/tracks', query)
        .once('error', err => this.errors.publish(err))
        .pipe(through.obj((track, _, done) => {
            tracks.push(track)
            this.findTrack(track)
            done()
        }, done => {
            this.observer.publish({
                label: 'Playlists'
              , method: 'getAllTracks'
              , params: {
                  tracks: tracks
                , title: title
                , playlist_name: this.label // 'Jamendo.Search'
               }
            })
            done()
        }))
    }

    findTrack (track) {
        this.websocket.write(JSON.stringify({
            method: 'findTrack'
          , params: track
        }))
    }

    onFindTrack (response) {
        if (response.method !== 'findTrack') return

        const track = response.params.value
        if (track._isInterested) this.observer.publish({
            method: 'changeTrackIsInterested'
          , params: {track: track}
        })

        return true
    }
}

export default JamendoSearch
