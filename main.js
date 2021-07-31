require('dotenv').config()

const path = require('path')
const events = require('events')

// const {version, validate} = require('uuid')

const favicon = require('serve-favicon')

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const mongoose = require('mongoose')
const Report = require('./backend/report')

const { Server } = require("socket.io");
const io = new Server(server);

const bus = new events.EventEmitter()

const benchmark_controller = require('./backend/benchmark_controller')(bus)
const search_controller = require('./backend/search_controller')

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

    function build_benchmark_notifyer(id) {
        return async function() {
            const report = await search_controller.get_benchmark(id)
            console.log(report)
            socket.emit('benchmark', report)
        }
    }

    function build_url_notifyer(url) {
        return async function() {
            const reports = await search_controller.get_url(url)
            socket.emit('url', reports)
        }
    }

    function attach_notifyer(id, map, create_notifyer) {
        if (!map.has(id)) {
            const notifyer = create_notifyer(id)
            map.set(id, notifyer)
            bus.on(id, notifyer)
            notifyer()
        }
    }

    function detach_notifyer(id, map) {
        if (map.has(id)) {
            bus.off(id, map.get(id))
            map.delete(id)
        }
    }

    const benchmark_notifyers = new Map()
    const url_notifyers = new Map()

    socket.on('get url', (url) => {
        attach_notifyer(url, url_notifyers, build_url_notifyer)
    })

    socket.on('stop url', (url) => {
        detach_notifyer(url, url_notifyers)
    })

    socket.on('get benchmark', (id) => {
        console.log(id)
        attach_notifyer(id, benchmark_notifyers, build_benchmark_notifyer)
    })

    socket.on('stop benchmark', (id) => {
        detach_notifyer(id, benchmark_notifyers)
    })

    socket.on('search', async (phrase, reply) => {
        reply(await search_controller.search(phrase))
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)

        for (let [id, notifyer] of benchmark_notifyers) {
            bus.off(id, notifyer)
        }
        for (let [url, notifyer] of url_notifyers) {
            bus.off(url, notifyer)
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
    useCreateIndex: true,
})