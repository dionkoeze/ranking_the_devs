const path = require('path')
const favicon = require('serve-favicon')

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'))
})

app.use(express.static(path.join(__dirname, '/static')))

// TODO favicon is not served?!
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
})

const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`listening on *:${port}`)
})