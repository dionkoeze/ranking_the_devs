const axios = require('axios')
const {Node} = require('./node')

const {performance} = require('perf_hooks')

class IncorrectResponseError extends Error {
    constructor(expected, received, ...params) {
        super(...params)
        this.expected = JSON.stringify(expected)
        this.received = JSON.stringify(received)

        if (Error.captureStackTrace) Error.captureStackTrace(this, IncorrectResponseError)

        this.name = 'IncorrectResponseError'
    }
}

// NOTE: only works for simple objects (no functions or DOM nodes)
function equal(lhs, rhs) {
    return JSON.stringify(lhs) === JSON.stringify(rhs)
}

function create_single_stopwatch(handle, endpoint, request, expected) {
    return new Node(handle.id, [], {
        async after() {
            const start = performance.now()
            const response = await axios.get(`${handle.url}/${endpoint}`, {params: request})
            const end = performance.now()
            const data = response.data

            if (!equal(expected, data)) throw new IncorrectResponseError(expected, data, 'incorrect result')

            return end - start
        },
    })
}

function create_average_stopwatch(handle, endpoint, requests, expecteds) {
    const children = []

    for (let i = 0; i < requests.length; i++) {
        const request = requests[i]
        const expected = expecteds[i]
        children.push(create_single_stopwatch(handle, endpoint, request, expected))
    }

    return new Node(handle.id, children)
}

module.exports = {
    create_single_stopwatch,
    create_average_stopwatch,
    IncorrectResponseError,
}