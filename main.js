const path = require('path')
const events = require('events')

const favicon = require('serve-favicon')

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const body_parser = require('body-parser')

const { Server } = require("socket.io");
const io = new Server(server);

const bus = new events.EventEmitter()

const benchmark_controller = require('./backend/benchmark_controller')(bus)
const scheduler = require('./backend/scheduler')(bus)
const statistics = require('./backend/statistics')(bus)

app.use(body_parser.json())

app.use(benchmark_controller)

app.use(express.static(path.join(__dirname, '/static')))

// TODO favicon is not served?!
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/index.html'))
})

bus.on('processing state', (processing) => {
    io.emit('processing', processing)
})

bus.on('queue state', (queue) => {
    io.emit('queue', queue)
})

bus.on('leaderboard state', (leaderboard) => {
    io.emit('leaderboard', leaderboard)
})

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    // TODO supply socket with initial data (current leaderboard etc)
})

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`listening on *:${port}`)
})
