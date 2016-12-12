'use strict'
import websocket    from 'websocket-stream'
import xtend        from 'xtend'
import through      from 'through2'
import Action       from '../../lib/flux/action'

class ActPlaylist extends Action {
    constructor () {
        super()
        this.websocket  = null
        this.uri        = null
        this.connected  = false
        this.label      = 'Jamendo.Playlist'
        this.anotherLabel = 'Jamendo.Search'
    }

    setWebsocket (websocket, readable) {
        this.websocket = websocket

        readable.on('data', response => {
            const methods = ['onGetAllTracks', 'onAddTrack', 'onRemoveTrack']
            methods.some(method => {return this[method](response) })
        })

        this.getAllTracks()
    }

    onGetAllTracks (response) {
        if (response.method !== 'getAllTracks') return

        const tracks = response.params.value.map(track => {
            track._isInterested = true
            return track
        })
        this.observer.publish({
            method: response.method
          , params: {
                tracks: tracks
              , title: 'our playlist'
              , playlist_name: this.label
            }
        })

        return true
    }

    onAddTrack (response) {
        if (response.method !== 'addTrack') return

        const track = response.params.value
        track._isInterested = true
        this.observer.publish({
            method: 'addTrack'
          , params: {
                track: track
              , playlist_name: this.label
            }
        })

        this.changeTrackIsInterested(track)
        return true
    }

    onRemoveTrack (response) {
        if (response.method !== 'removeTrack') return

        const track = response.params.value
        delete track._isInterested
        this.observer.publish({
            method: 'removeTrack'
          , params: {
                track: track
              , playlist_name: this.label
            }
        })

        this.changeTrackIsInterested(track)
        return true
    }

    changeTrackIsInterested (track) {
        this.observer.publish({
            method: 'changeTrackIsInterested'
          , params: {
                track: track
            }
        })
    }

    getAllTracks () {
        this.websocket.write(JSON.stringify({
            method: 'getAllTracks'
          , params: {}
        }))
    }

    addTrack (params) {
        this.websocket.write(JSON.stringify({
            method: 'addTrack'
          , params: params.track
          , doBroadcast: true
        }))
    }

    removeTrack (params) {
        this.websocket.write(JSON.stringify({
            method: 'removeTrack'
          , params: params.track
          , doBroadcast: true
        }))
    }
}

export default ActPlaylist
