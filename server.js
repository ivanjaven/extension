const https = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const app = next({ dev: false })
const handle = app.getRequestHandler()

// Process-wide configuration to ignore certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

app.prepare().then(() => {
  const options = {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
    // Add these options to suppress security warnings
    secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
    requestCert: false,
    rejectUnauthorized: false
  }

  const server = https
    .createServer(options, (req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })

  // Error handling to prevent unhandled errors from crashing the server
  server.on('tlsClientError', (err) => {
    console.warn('TLS Client Error (can be safely ignored):', err)
  })

  server.listen(3000, '0.0.0.0', () => {
    console.log('> Secure server ready on https://192.168.0.109:3000')
  })
})