'use strict'
import React        from 'react'

const ButtonPlaylistAddTrack = (props) => {
    const method        = props.data._isInterested
                        ? 'removeTrack' : 'addTrack'
    const iconClassName = props.data._isInterested
                        ? 'fa fa-heart' : 'fa fa-heart-o'
    return (
        <a
            className="button is-jamendo"
            onClick={e => {
                props.helper(method, {track: props.data})
            }}
        >
            <i className={iconClassName}></i>
        </a>
    )
}

export default ButtonPlaylistAddTrack
