'use strict'
import xtend            from 'xtend'
import setup            from '../lib/flux/setup'
import Jamendo          from '../lib/jamendo'
import {client_id}      from '../client_id'
import ActWebsocket     from './actions/websocket'
import ActPlaylist      from './actions/playlist'
import ActPlayerControl from './actions/player-control'
import ActJamendoSeach  from './actions/jamendo-search'
import StorePlaylists   from './stores/playlists'
import StorePlaylist    from './stores/playlist'
import StoreTrack       from './stores/track'
import * as defs        from './default-states'

function workerApp (self) {
    const jamendo = new Jamendo(client_id, {
        https:           true
      , followRedirects: true
    })

    const actPlaylist      = new ActPlaylist
    const actPlayerControl = new ActPlayerControl
    const actWebsocket     = new ActWebsocket
    const actJamendoSearch = new ActJamendoSeach(jamendo, {
        limit:     60
      , imagesize: 70
      , order:     'popularity_week'
    })

    actWebsocket.onConnect((websocket, readable) => {
        actPlaylist.setWebsocket(     websocket, readable)
        actJamendoSearch.setWebsocket(websocket, readable)
    })

    const storeOurPlaylist  = new StorePlaylist({
        title: 'our playlist'
      , tracks: []
      , track: null
      , playlist_name: 'Jamendo.Playlist'
    })

    const storeSearchResult  = new StorePlaylist({
        title: null
      , tracks: []
      , track: null
      , playlist_name: 'Jamendo.Search'
    })

    const storePlaylists = new StorePlaylists({
        playlists: {
            'Jamendo.Playlist': storeOurPlaylist.defaultState
          , 'Jamendo.Search':   storeSearchResult.defaultState
        }
      , currentPlaylist: null
    }, [storeOurPlaylist, storeSearchResult])

    const storeTrack     = new StoreTrack({
        track:         null
      , playlist_name: null
    }, [storePlaylists])

    const actions = [
        actPlaylist
      , actPlayerControl
      , actJamendoSearch
      , actWebsocket
    ]

    const stores = [
        storeTrack
    ]

    setup(self, actions, stores)
}

export default workerApp
