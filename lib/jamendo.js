var url        = require('url')
var xtend      = require('xtend')
var bl         = require('bl')
var hyperquest = require('hyperquest')
var stream     = require('readable-stream')

var HOSTNAME = 'api.jamendo.com'
var VERSION  = 'v3.0'

module.exports = exports = Jamendo
if (process.env.DEV === 'test') Jamendo._createRequestURI = createRequestURI

function Jamendo (client_id, _client_secret, _opt) {
    if (!(this instanceof Jamendo)) return new Jamendo(client_id, _client_secret, _opt)

    if (! client_id) throw new Error('"client_id" not found')
    if (typeof client_id !== 'string') throw new TypeError('"client_id" must be "string"')

    if (_client_secret && isObject(_client_secret)) {
        _opt            = _client_secret
        _client_secret  = null
    }

    if (_client_secret) {
        if (typeof _client_secret !== 'string') throw new TypeError('"_client_secret" must be "string"')
        this.client_secret = _client_secret
    }

    var opt = xtend(_opt)
    this.client_id = client_id
    this.protocol  = opt.https ? 'https:' : 'http:'
    this.hostname  = HOSTNAME
    this.version   = VERSION
    this.followRedirects = opt.followRedirects
    this.redirectToFile  = !! opt.redirectToFile
}

Jamendo.prototype.request = function (endpoint, _params, _opt, cb) {
    if (! endpoint) throw new Error('"endpoint" not found')
    if (typeof endpoint !== 'string') throw new TypeError('"endpoint" must be "string"')
    if (! _params) throw new Error('"_params" not found')
    if (! isObject(_params)) throw new TypeError('"_params" must be "object"')
    if (typeof _opt === 'function') {
        cb = _opt
        _opt = {}
    }
    if (typeof cb !== 'function') cb = null

    var opt    = xtend(_opt)
    var params = xtend(_params, {client_id: this.client_id})
    var uri    = createRequestURI(endpoint, params, this.protocol, this.hostname, this.version)

    if (/\/file\/?$/.test(endpoint))
        return file(uri, opt, cb, this.redirectToFile)
    else
        return get(uri, opt, cb, this.followRedirects)
}

function file (uri, opt, cb, redirectToFile) {
    var ws
    if (! cb) {
        ws = new stream.Transform
        ws._transform = function (chnk, _, done) {
            done(null, chnk)
        }
    }

    redirectToFile ? handle(uri, opt) : handleNotRedirectFile(uri, opt)

    return ws

    function onError (err, response) {
        cb ? cb(err, null, response) : ws.emit('error', err)
    }

    function handle (uri, opt) {
        var hyp = hyperquest(uri, opt)

        hyp.on('response', function (response) {
            if (isRedirect(hyp.request, response)) {
                var headers = xtend(opt.headers, {referer: uri})
                return handle(url.resolve(uri, response.headers.location), xtend(opt, {headers: headers}))
            }

            ws && ws.emit('response', response)

            if (response.statusCode >= 400 && response.statusCode < 600) {
                return response.pipe(bl(function (err, data) {
                    if (! err) {
                        err = new Error(String(data))
                        err.statusCode = response.statusCode
                    }
                    onError(err, response)
                }))
            }

            response.pipe(cb ? bl(onResEnd) : ws)

            function onResEnd (err, data) {
                cb(err, data, response)
            }
        })
        return hyp
    }

    function handleNotRedirectFile (uri, opt) {
        var hyp = hyperquest(uri, opt)

        hyp.on('response', function (response) {
            ws && ws.emit('response', response)

            if (isRedirect(hyp.request, response)) {
                if (cb) return cb(null, response.headers.location, response)
                else return ws.end(response.headers.location)
            }

//            if (response.statusCode >= 400 && response.statusCode < 600) {
                return response.pipe(bl(function (err, data) {
                    if (! err)  err = new Error(String(data))
                    err.statusCode = response.statusCode
                    onError(err, response)
                }))
//            }
        })
        return hyp
    }
}

function get (uri, opt, cb, _followRedirects) {
    var followRedirects = !! _followRedirects
    var redirect        = null
    var count           = followRedirects ? 0 : null
    var maxRedirects    = followRedirects ? typeof _followRedirects === 'number' ? parseInt(_followRedirects, 10) : 10 : 0

    opt.headers = xtend(opt.headers, {'accept': 'application/json'})

    var rs
    if (! cb) {
        rs = new stream.Readable({objectMode: true})
        rs._read = function () {}
    }

    handle(uri, opt)

    return rs

    function onError (err, response) {
        cb ? cb(err, null, response) : rs.emit('error', err)
    }

    function handle (uri, opt) {
        var hyp = hyperquest(uri, opt)

        if (followRedirects) {
            hyp.on('response', function (response) {
                isRedirect(hyp.request, response) && (redirect = response.headers.location)
            })
        }

        hyp.pipe(bl(function (err, data) {
            if (redirect) {
                if ((count += 1) >= maxRedirects)
                    return onError(new Error('Response was redirected too many times :('), hyp.response)

                var headers = xtend(opt.headers, {referer: uri})
                handle(url.resolve(uri, redirect), xtend(opt, {headers: headers}))
                return (redirect = null)
            }

            rs && rs.emit('response', hyp.response)

            if (err) return onError(err, hyp.response)
            if (! data.length) return cb && cb(null, null, hyp.response)

            var ret
            try {
                ret = JSON.parse(String(data))
            } catch (_err) {
                var e = new SyntaxError('JSON parse error: ' + _err.message, _err)
                e.data = data
                e.response = hyp.response
                return onError(e, hyp.response)
            }

            rs && rs.emit('Jamendo.Api.Response', ret)

            if (ret.headers && ret.headers.code !== 0) {
                var e = new Error(ret.headers.error_message)
                e.name = ret.headers.status
                e.data = ret.headers
                return onError(e, hyp.response)
            }

            cb ? cb(null, ret, hyp.response) : push()

            function push () {
                ;[].concat(ret.results).forEach(function (result) {
                    rs.push(result)
                })
                rs.push(null)
            }
        }))

        return hyp
    }
}

function createRequestURI (endpoint, params, protocol, host, version) {
    if (endpoint.slice(0, 1) !== '/') endpoint = '/' + endpoint
    if (endpoint.slice(-1)   !== '/') endpoint = endpoint + '/'

    var querys = []
    for (var p in params) {
        if (Object.prototype.hasOwnProperty.apply(params, [p]))
            querys = querys.concat([encodeURIComponent(p), map(params[p])].join('='))
    }

    return protocol + '//' + host + '/' + version + endpoint + '?' + querys.join('&')

    function map (p) {
        if (! Array.isArray(p)) p = String(p).split(' ')
        return p.map(encodeURIComponent).join('+')
    }   
}

function isRedirect (req, res) {
    return req.method === 'GET' &&
           res.headers.location &&
           String(res.statusCode).slice(0, 1) === '3'
}

function isObject (p) {
    return Object.prototype.toString.apply(p) === '[object Object]'
}
