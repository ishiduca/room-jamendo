'use strict'
import Action from '../../lib/flux/action'

class ActPlayerControl extends Action {
    selectTrack (params) {
        this.observer.publish({
            method: 'selectTrack'
          , params: params
        })
    }

    nextTrack (params) {
        this.observer.publish({
            method: 'nextTrack'
          , params: params
        })
    }
}

export default ActPlayerControl
