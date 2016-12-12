'use strict'
import xtend        from 'xtend'
import React        from 'react'
import Search       from './search'
import Player       from './player'
import Playlist     from './playlist'
import helper       from '../actions/helper'
import * as defs    from '../default-states'

class App extends React.Component {
    constructor (props) {
        super(props)
        this.helper = helper(this.props.worker)
        this.state = xtend(
            defs.Playlists
          , defs.Track
        )
    }

    componentDidMount () {
        this.props.worker.addEventListener('message', ev => {
            console.log('main.worker.onmessage')
            console.dir(ev.data)
            this.setState(ev.data)
        })
        this.props.worker.addEventListener('error', err => {
            console.error(err)
        })

        this.helper('getURI', getURI())
    }

    render () {
        return (
            <div
                id="application"
                role="application"
            >
                <div id="wrap-audio-player">
                    <Player
                        helper={this.helper}
                        worker={this.props.worker}
                        track={this.state.track}
                        playlist_name={this.state.playlist_name}
                    />
                </div>
                <div id="wrap-search">
                    <Search worker={this.props.worker} helper={this.helper} />
                </div>
                <div className="rows"
                    style={{
                        justifyContent: 'space-around'
                      , flexWrap:       'wrap'
                    }}
                >
                    <div id="our-playlist">
                        <Playlist
                            helper={this.helper}
                            worker={this.props.worker}
                            playlist={this.state.playlists['Jamendo.Playlist']}
                        />
                    </div>
                    <div id="jamendo-search">
                        <Playlist
                            helper={this.helper}
                            worker={this.props.worker}
                            playlist={this.state.playlists['Jamendo.Search']}
                        />
                    </div>
                </div>
            </div>
       )
    }
}

function getURI () {
    return [ location.protocol.replace('http', 'ws'), location.host].join('//')
}

export default App
