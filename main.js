require('dotenv').config()

const path = require('path')
const events = require('events')

const favicon = require('serve-favicon')

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const mongoose = require('mongoose')

const { Server } = require("socket.io");
const io = new Server(server);

const bus = new events.EventEmitter()

const benchmark_controller = require('./backend/benchmark_controller')(bus)

// register all event listeners
require('./backend/benchmark')(bus)
require('./backend/scheduler')(bus)
require('./backend/statistics')(bus)


// register express middleware
app.use(express.json())


// register express routers
app.use(benchmark_controller)


// host static files
app.use(express.static(path.join(__dirname, '/static')))

// TODO favicon is not served?!
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/index.html'))
})


// expose state
let processing_state, queue_state, leaderboard_state

bus.on('processing state', (processing) => {
    processing_state = processing
    io.emit('processing', processing)
})

bus.on('queue state', (queue) => {
    queue_state = queue
    io.emit('queue', queue)
})

bus.on('leaderboard state', (leaderboard) => {
    leaderboard_state = leaderboard
    io.emit('leaderboard', leaderboard)
})


// handle new connection by supplying current state
io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    // supply socket with initial data
    socket.emit('processing', processing_state)
    socket.emit('queue', queue_state)
    socket.emit('leaderboard', leaderboard_state)

    function build_notifyer(id) {
        return async function() {
            // TODO fetch benchmark with id from db
            // socket.emit(id, benchmark)
            socket.emit(id, id)
        }
    }

    const notifyers = new Map()

    socket.on('get benchmark', (id) => {
        if (!notifyers.has(id)) {
            const notifyer = build_notifyer(id)
            notifyers.set(id, notifyer)
            bus.on(id, notifyer)
            notifyer()
        }
    })

    socket.on('stop benchmark', (id) => {
        if (notifyers.has(id)) {
            bus.off(id, notifyers.get(id))
            notifyers.delete(id)
        }
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)

        for (let [id, notifyer] of notifyers) {
            bus.off(id, notifyer)
        }
    })
})


// start server
const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`listening on *:${port}`)

    bus.emit('online')
})


// connect mongoose
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.gwez9.mongodb.net/Cluster0`, {
    retryWrites: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})