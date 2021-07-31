window.socket = require('socket.io-client')()

const m = require('mithril')

const title = require('./title')
const leaderboard = require('./leaderboard')
const queue = require('./progress')
const benchmarks = require('./benchmarks')

const landing = {
    view() {
        return [
            m(title),
            m(leaderboard),
            m(queue),
            m(benchmarks),
        ]
    }
}

const root = document.body
m.mount(root, landing)