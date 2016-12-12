'use strict'
import xtend    from 'xtend'
import Store    from '../../lib/flux/store'

class StoreTrack extends Store {
    selectTrack (params, statePlaylists) {
        this.setState(params)
        this.observer.publish(xtend(this.getState(), statePlaylists))
    }

    nextTrack (params, statePlaylists) {
        const playlist = statePlaylists.playlists[params.playlist_name]
        this.setState({
            track: playlist.track
          , playlist_name: params.playlist_name
        })
        this.observer.publish(xtend(this.getState(), statePlaylists))
    }

    changeTrackIsInterested (params, statePlaylists) {
        const trackId = (this.getState('track') || {}).id
        if (params.track.id === trackId)
            this.setState({track: params.track})

        this.observer.publish(xtend(this.getState(), statePlaylists))
    }
}

export default StoreTrack
