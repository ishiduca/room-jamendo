'use strict'
import React            from 'react'
import ReactAudioPlayer from 'react-audio-player'
import ButtonPlaylistAddTrack   from './button-add-track'

const Player = (props) => {
    const track = props.track || {}
    return (
        <div className="rows" style={{
            flexWrap: 'wrap'
        }}>
            <div>
                <img src={track.image || ''} />
            </div>
            <div>
                <ReactAudioPlayer
                    src={track.audio}
                    controls={true}
                    autoPlay={true}
                    onEnded={e => {
                        props.helper('nextTrack', {
                            track: track
                          , playlist_name: props.playlist_name
                        })
                    }}
                />
            </div>
            <div>
                <h5>{track.name}
                    <span style={{fontSize: 'smaller'}}
                    >{
                        track.album_name &&
                        (' (via ' + track.album_name + ') ')
                    }</span>
                </h5>
                <p>{track.artist_name}</p>
            </div>
            <div>
                {track.id && (
                    <ButtonPlaylistAddTrack
                        helper={props.helper}
                        worker={props.worker}
                        data={track}
                    />
                )}
            </div>
        </div>
    )
}

export default Player
