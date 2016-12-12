'use strict'
import websocket    from 'websocket-stream'
import through      from 'through2'
import Action       from '../../lib/flux/action'

class ActWebsocket extends Action {
    constructor () {
        super()
        this.websocket  = null
        this.uri        = null
        this.connected  = false
        this.onConnectedCallback = null
    }

    getURI (uri) {
        this.uri = uri
        this.setup()
    }

    onConnect (sub) {
        return (this.onConnectedCallback = sub)
    }

    setup () {
        this.websocket = websocket(this.uri)

        const writable = through.obj((buf, _, done) => {
            const resStr = String(buf)
            var response; try {
                response = JSON.parse(resStr)
            } catch (_err) {
                let error = new Error('JSON.parse error. "' + resStr + '"')
                error.data = resStr
                console.error(error)
                this.errors.publish(error)

                return done()
            }

            console.log('--> Response:')
            console.dir(response)

            done(null, response)
        })

        this.websocket.once('error', err => {
            console.error(err)
            this.errors.publish(err)
        })
        .once('close', () => {
            this.connected = false
            console.log('websocket closed')
            setTimeout(this.setup.bind(this), 500)
        })
        .once('connect', () => {
            this.connected = true
            console.log('websocket connected %s', this.uri)
            this.onConnectedCallback(this.websocket, writable)
        })
        .pipe(writable)
    }
}

export default ActWebsocket
