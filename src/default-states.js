const Playlists = {
    currentPlaylist: null // 'Jamendo.Search' | 'Jamendo.Playlist'
//  , currentTrack:    null // {track}
  , playlists: {
        'Jamendo.Search': {
            title: null
          , tracks: []
          , playlist_name: 'Jamendo.Search'
          , track: null
        }
      , 'Jamendo.Playlist': {
            title: 'Jamendo.Playlist'
          , tracks: []
          , playlist_name: 'Jamendo.Playlist'
          , track: null
         }
    }
}

const Track = {
    track: null
  , playlist_name: null
}

export {
    Playlists
  , Track
}
