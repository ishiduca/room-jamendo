'use strict'
import Store    from '../../lib/flux/store'

class StorePlaylist extends Store {
    getAllTracks (params) {
        if (! this._isPlaylist(params))
            return this.observer.publish(null)

        this.setState(params)
        this.observer.publish(this.getState())
    }

    addTrack (params) {
        if (! this._isPlaylist(params))
            return this.observer.publish(null)

        const tracks = this.getState('tracks')
        this.setState({tracks: tracks.concat(params.track)})
        this.observer.publish(this.getState())
    }

    removeTrack (params) {
        if (! this._isPlaylist(params))
            return this.observer.publish(null)

        const tracks = this.getState('tracks').filter(track => {
            return track.id !== params.track.id
        })

        this.setState({tracks: tracks})
        this.observer.publish(this.getState())
    }

    selectTrack (params) { // track, playlist_name
        if (! this._isPlaylist(params))
            return this.observer.publish(null)

        this.setState({track: params.track})
        this.observer.publish(this.getState())
    }

    nextTrack (params) {
        if (! this._isPlaylist(params))
            return this.observer.publish(null)

        const tracks = this.getState('tracks')
        const setState = n => {
            this.setState({track: tracks[n]})
            this.observer.publish(this.getState())
        }

        for (var i = 0; i < tracks.length; i += 1) {
            if (tracks[i].id === params.track.id) {
                return setState((i + 1) % tracks.length)
            }
        }

        console.log('StatePlaylist.nextTrack: currentTrack not found')
        setState(0)
    }

    changeTrackIsInterested (params) {
//        if (! this._isPlaylist(params))
//            return this.observer.publish(null)

        const tracks = this.getState('tracks').map(track => {
            return (track.id === params.track.id) ? params.track
                                                  : track
        })

        this.setState({tracks: tracks})
        this.observer.publish(this.getState())
    }

    _isPlaylist (params) {
        const playlist_name = this.getState('playlist_name')
        if (playlist_name !== params.playlist_name) return false
        else return true
    }
}

export default StorePlaylist
