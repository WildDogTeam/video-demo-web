require('./check-versions')()

var config = require('../config')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var https = require('https')
var fs = require('fs')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {},
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({
      action: 'reload'
    })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = {
      target: options
    }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'https://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})
const options = {
  key: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA13S893b36icJj9VRjJ9/bny8cp65pToudTDVswsL+Ubi1GUk
dEvJuVXG+HRRZbrcWg2g6Zud2QbokyFywYHQU636uHgRTKFy6ed2+mMeDKZnt4kY
F0oFnNPtYmkA9/xN0SvwIPuu4RRL/RS8vYcwrmAe9lLlmpv5yJN15rIocWh6L9hK
iwF0cxJ6aWPRW2qDHbBcKNuiJinrgpCDSO6utbJ1cKS9lm+Q0GeraLuwJ1E1b5AY
5m3IU2jTSCFZE1ZBL9l6Ju3Z7d79TAcG8CN7v5ATuHGrFmrP6dC9GDXxJCMLOAm+
EXw07qhTSmYOHlxDVjoWv2hDzYgwCSaAw1r/SQIDAQABAoIBADWC6+/2X0qLmYdc
rt1jO84gMtmw7GDKG4HFuD24r6eg4HNqD2zG6fobAMjycsj2aQYAvodmvASL/7WT
KCJBcJFn845fW8SRkK3hbB5yAaOYrMfbx9z46H3z8NBxTelJg7ZA2GoIuH10gg8A
WIQmEIQuoWICYr5MoPQdE7pRY1QO7tA7JLuINRsVkh0U3hajVyjiUzGna8Gw/Xn6
vFWrMYCJzmqh9RywfuSlu3PR72eol6/CjX4YBuzzVfxmmRMtiBDjU8hQAt/A7jkx
jzTMDBG1cY2i9CJGvWCZIZ6kqrHOcaVVxX0ktAg2nR7z0m7d0Tw8fVRI8yLL71N/
TsKun1ECgYEA/akWut1KooCbBYB8I4wFD5aq4GxM1w3swe2djV00jajc3DeliUYI
dIdYdl1yXfFOtVLXV6SEkpwClRjdeGTBSEnNZ56yY3xPwlDjBFrZNAUEANUY/PRD
H4XXlpWBlubj6CQrhf+DrghcElaPx/cev+9N08uLb9TGQJWkSv0NIg0CgYEA2XFy
GvvpzKBnjYd01R8Y/H8eVPfTbDEfx8mSFrTsZGaCSh7+O7Yu1+IgncAiH8dRcrjs
84NYh8CkpscviMR/L3+nT2NqvLwEfyCTd1MKgaRY6EvRUL0XOkEc1UvTdOPpOaJ2
9CC4awQDWbr/eX5SGWmBroCS9sv+0L5w8+QyTy0CgYEA2UkdsmZbR4ZYxMbCEAUi
VK8gouvCirlf5OMxgeWkXfCXeICmaUe3eHJz4bi8fiJ15LcYxfekpJ3FTIinNjlA
pDasICX982CKRg7Z2GImCvx86GWiaRSn5vnUqiZZgrU35yQMsFUnLE326LKDqaxT
B+DqzxFd2SbvyGUm/iF0PYUCgYAQXR09MqARqjCg0gTU1RZISji6JDxg9AF0Q5Me
6lav55b+hP6U98zmqjnSJVdsFM/oVkpeuQ+8h57cfjjxjfgUVwL8UnsB4RRljMoM
PM+Zmgim0q3Z6aEJ3USSOLadIVm34KYbEStPwmmOIyh+uCbtiqcbvslQkWGHzA0s
DYxLsQKBgCVRVdvvpkY3khTqrmM/MAI3JNaex/3rIb+uU/ac2CQz0Bny5UD9P6vt
LVOxWlZUtHJjR7HC639Ne/B1FvuQ9RjQ/NsOquMAu5gqBeNbwSl6Z+l4nocSdif/
hC6waBwTQA8ccq4IwEJQb6HA5idl8rXcyHEyflYy4UFP8TboQmOM
-----END RSA PRIVATE KEY-----`,
  cert: `-----BEGIN CERTIFICATE-----
MIIDBjCCAe4CCQCuXxkMMVEvwDANBgkqhkiG9w0BAQsFADBFMQswCQYDVQQGEwJB
VTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0
cyBQdHkgTHRkMB4XDTE1MTIyMzA3MzIzOVoXDTE2MTIyMjA3MzIzOVowRTELMAkG
A1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoMGEludGVybmV0
IFdpZGdpdHMgUHR5IEx0ZDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
ANd0vPd29+onCY/VUYyff258vHKeuaU6LnUw1bMLC/lG4tRlJHRLyblVxvh0UWW6
3FoNoOmbndkG6JMhcsGB0FOt+rh4EUyhcunndvpjHgymZ7eJGBdKBZzT7WJpAPf8
TdEr8CD7ruEUS/0UvL2HMK5gHvZS5Zqb+ciTdeayKHFoei/YSosBdHMSemlj0Vtq
gx2wXCjboiYp64KQg0jurrWydXCkvZZvkNBnq2i7sCdRNW+QGOZtyFNo00ghWRNW
QS/Zeibt2e3e/UwHBvAje7+QE7hxqxZqz+nQvRg18SQjCzgJvhF8NO6oU0pmDh5c
Q1Y6Fr9oQ82IMAkmgMNa/0kCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEATNybwzTB
CrX3YwRrVnKeOE6nqmg6Jnl+4GHFp/CMIg184KZZl0RvEkc5i2WevCSAh1gwEexU
cwD1gVZ6MQu0efEh4Lql+WEtQ+tATT4+Dr4yqs66GqRvJG1Adk6g774KGh1ESgT6
bkoRQYAFrFtVInyBwkIygoCq40Erfo+AASXDrODZaJtVRgdlCR8IS3bvdmTQ17EM
8hMnTgDr+eqHDYRvkPZKHmFVVxjOggV21Mppok6Y+WsGyUcGMT4hGZtUEN8qRfnK
Pp16pUZE8jAgMaFYq3O6TTArCuzIZ6lMzI+eWfBYToY76jbGXH2eOMKmk6O/VPiD
hsrXSK8e75rQcg==
-----END CERTIFICATE-----`
};

// var server = app.listen(port)
var server = https.createServer(options, app).listen(port);

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
