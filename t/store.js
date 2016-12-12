'use strict'
const test  = require('tape')
const Store = require('flux/store')

test('const store = new Store(defaultState, [childrenStores])', t => {
    const defaultState = {
        title: 'searched'
      , tracks: []
      , track: null
      , playlist_name: 'Searched'
    }

    const searched = new Store(defaultState)

    t.test('store.getState(key)', tt => {
        tt.deepEqual(searched.defaultState, defaultState)
        tt.is(searched.getState('title'), 'searched')
        tt.deepEqual(searched.getState(), defaultState)
        tt.end()
    })

    t.test('stoe.setState(state)', tt => {
        searched.setState({
            track: {id: 1234, name: 'Rocking out'}
        })

        t.deepEqual(searched.getState(), {
            title: 'searched'
          , tracks: []
          , track: {id: 1234, name: 'Rocking out'}
          , playlist_name: 'Searched'
        })
        tt.end()
    })

    t.end()
})

test('store.post(payload)', t => {
    const defaultState = {
        title: 'searched'
      , tracks: []
      , track: null
      , playlist_name: 'Searched'
    }

    const searched = new Store(defaultState)

    searched.addTrack = function (track) {
        const tracks = this.getState('tracks').concat(track)
        this.setState({tracks: tracks})
        this.observer.publish(this.getState())
    }

    searched.observer.once(function (state) {
        t.deepEqual(state, {
            title: 'searched'
          , tracks: [{id: 1234, name: 'Rocking out'}]
          , track: null
          , playlist_name: 'Searched'
        })
        t.end()
    })

    searched.post({
        method: 'addTrack', params: {id: 1234, name: 'Rocking out'}
    })
})

test('', t => {
    const searched = new Store({
        title: 'searched'
      , tracks: [{id: 1234, name: 'Rocking out'}]
      , track: null
      , playlist_name: 'Searched'
    })

    const ours  = new Store({
        title: 'playlist ours'
      , tracks: [{id: 2345, name: 'Fireballs'}]
      , track: null
      , playlist_name: 'OurPlaylist'
    })

    function addTrack (params) {
        const playlist_name = this.getState('playlist_name')
        if (params.playlist_name !== playlist_name) {
            return this.observer.publish(null)
        }

        const tracks = this.getState('tarcks')
        this.setState({tracks: this.getState('tracks').concat(params.track)})
        this.observer.publish(this.getState())
    }

    searched.addTrack = addTrack
    ours.addTrack     = addTrack

    const playlists = new Store({}, [searched, ours])

    playlists.observer.once(function (states) {
        t.deepEqual(states, {
            title: 'playlist ours'
          , track: null
          , tracks:[
                {id: 2345, name: 'Fireballs'}
              , {id: 3456, name: 'Fuck it'}
            ]
          , playlist_name: 'OurPlaylist'
        })
        t.end()
    })

    playlists.post({
        method: 'addTrack'
      , params: {
          track: {id: 3456, name: 'Fuck it'}
        , playlist_name: 'OurPlaylist'
       }
    })
})

test('', t => {
    const searched = new Store({
        title: 'searched'
      , tracks: [{id: 1234, name: 'Rocking out'}]
      , track: null
      , playlist_name: 'Searched'
    })

    const ours  = new Store({
        title: 'playlist ours'
      , tracks: [{id: 2345, name: 'Fireballs'}]
      , track: null
      , playlist_name: 'OurPlaylist'
    })

    function addTrack (params) {
        const playlist_name = this.getState('playlist_name')
        if (params.playlist_name !== playlist_name) {
            return this.observer.publish(null)
        }

        const tracks = this.getState('tarcks')
        this.setState({tracks: this.getState('tracks').concat(params.track)})
        this.observer.publish(this.getState())
    }

    searched.addTrack = addTrack
    ours.addTrack     = addTrack

    const playlists = new Store({
        Searched: searched.defaultState
      , OurPlaylist: ours.defaultState
    }, [searched, ours])

    playlists.addTrack = function (params, state) {
        const playlist_name = params.playlist_name
        const STATE = {}; STATE[playlist_name] = state
        this.setState(STATE)
        this.observer.publish(this.getState())
    }

    playlists.observer.once(function (states) {
        t.deepEqual(states, {
            OurPlaylist: {
                title: 'playlist ours'
              , track: null
              , tracks:[
                    {id: 2345, name: 'Fireballs'}
                  , {id: 3456, name: 'Fuck it'}
                ]
              , playlist_name: 'OurPlaylist'
            }
          , Searched: {
                title: 'searched'
              , track: null
              , tracks:[
                    {id: 1234, name: 'Rocking out'}
                ]
              , playlist_name: 'Searched'
            }
        })
        t.end()
    })

    playlists.post({
        method: 'addTrack'
      , params: {
          track: {id: 3456, name: 'Fuck it'}
        , playlist_name: 'OurPlaylist'
       }
    })
})
