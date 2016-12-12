'use strict'
import Store    from '../../lib/flux/store'

class StorePlaylists extends Store {
    getAllTracks (params, statePlaylist) {
        this._updatePlaylist(params, statePlaylist)
    }

    addTrack (params, statePlaylist) {
        this._updatePlaylist(params, statePlaylist)
    }

    removeTrack (params, statePlaylist) {
        this._updatePlaylist(params, statePlaylist)
    }

    selectTrack (params, statePlaylist) {
        this._updatePlaylist(params, statePlaylist)
    }

    nextTrack (params, statePlaylist) {
        this._updatePlaylist(params, statePlaylist)
    }

    changeTrackIsInterested (params, statePlaylist) {
        this._updatePlaylist(params, statePlaylist)
    }

    _updatePlaylist (params, statePlaylist) {
        const playlists  = this.getState('playlists')
        playlists[statePlaylist.playlist_name] = statePlaylist

        this.setState({playlists: playlists})
        this.observer.publish(this.getState())
    }
}

export default StorePlaylists
