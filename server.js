const https = require('https')
const fs = require('fs')
const { parse } = require('url')
const next = require('next')

const app = next({ dev: false })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./192.168.1.6-key.pem'),
  cert: fs.readFileSync('./192.168.1.6.pem'),
}

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
    .listen(3000, '0.0.0.0', () => {
      console.log('> Production server ready on https://192.168.1.6:3000')
    })
})
