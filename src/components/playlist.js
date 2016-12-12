'use strict'
import React        from 'react'
import ButtonPlaylistAddTrack   from './button-add-track'

const ButtonSelectCurrentTrack = (props) => {
    return (
        <a
            onClick={e => {
                props.helper('selectTrack', {
                    track: props.data
                  , playlist_name: props.playlist_name
                })
            }}
        >
            <img src={props.data.image} />
        </a>
    )
}

const Playlist = (props) => {
    return (
        <div className="cols">
            <h2>{props.playlist.title || props.playlist.playlist_name}</h2>
            {props.playlist.tracks.map(track => {
                const hit = track.id === (props.playlist.track || {}).id
                return (
                    <div
                        key={track.id}
                        className="rows"
                        style={{
                            backgroundColor: hit ? '#aaaaaa' : ''
                          , alignItems: 'center'
                          , borderTop: '1px solid #333333'
                        }}
                    >
                        <div>
                            <ButtonSelectCurrentTrack
                                helper={props.helper}
                                worker={props.worker}
                                data={track}
                                playlist_name={props.playlist.playlist_name}
                            />
                         </div>
                         <div style={{
                            flexGrow: 1
                          , padding: '3px 6px'
                         }}>
                            <h5>
                                {track.name}
                                <span style={{fontSize:'smaller'}}>
                                    {' (via ' + track.album_name + ') '}
                                </span>
                            </h5>
                            <p>{track.artist_name}</p>
                         </div>
                         <div>
                            <ButtonPlaylistAddTrack
                                helper={props.helper}
                                worker={props.worker}
                                data={track}
                            />
                         </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Playlist
