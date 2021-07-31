const m = require('mithril')

const url_regex = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)

const scheduler_state = {
    // url: '',
    url: 'http://localhost:4321', // for testing
    pristine: true,
    // valid: false,
    valid: true, // for testing
    waiting: false,
    success: false,
    error: false,
    message: '',
    set_url(value) {
        if (value.search("http://") === -1 && value.search("https://") === -1) {
            this.url = "https://" + value
        } else {
            this.url = value
        }
        this.pristine = false
        // this.valid = url_regex.test(this.url)
        this.valid = true
    },
    status_waiting() {
        this.waiting = true
    },
    status_success() {
        this.waiting = false
        this.success = true
        setTimeout(() => {
            this.success = false
            m.redraw()
        }, 2000);
    },
    status_error(message) {
        this.waiting = false
        this.error = true
        this.message = message
        setTimeout(() => {
            this.error = false
            m.redraw()
        }, 5000);
    },
    reset() {
        this.pristine = true
        this.valid = false
        this.url = ''
    },
}

const content_state = {
    entity: '',
    benchmark: {},
    url: [],
    is_id: false,
    is_url: false,
    set_id(id) {
        this.clear()
        this.entity = id
        socket.emit('get benchmark', id)
        this.is_id = true
    },
    set_url(url) {
        this.clear()
        this.entity = url
        socket.emit('get url', url)
        this.is_url = true
    },
    clear() {
        if (this.is_id) {
            socket.emit('stop benchmark', this.entity)
            this.benchmark = {}
        }
        if (this.is_url) {
            socket.emit('stop url', this.entity)
            this.url = []
        }
        this.entity = ''
        this.benchmark = {}
        this.url = []
        this.is_id = false
        this.is_url = false
    },
}

// listen to incoming benchmarks and url overviews
socket.on('benchmark', (benchmark) => {
    content_state.benchmark = benchmark
    m.redraw()
})
socket.on('url', (url) => {
    content_state.url = url
    m.redraw()
})

const search_state = {
    phrase: '',
    waiting: false,
    found: false,
    empty: true,
    complete: false,
    is_id: false,
    is_url: false,
    options: [],
    _scheduled: false,
    reset() {
        this.waiting = false
        this.found = false
        this.is_id = false
        this.is_url = false
        this.complete = false
        this.options = []
    },
    set_value(phrase) {
        this.empty = (phrase === '')
        this.phrase = phrase
        if (this.empty) {
            this.reset()
        } else {
            this.waiting = true
            this.schedule()
        }
    },
    schedule() {
        // this is a debounce
        if (!this._scheduled) {
            this._scheduled = true
            setTimeout(() => {
                socket.emit('search', this.phrase, (response) => {
                    this.waiting = false
                    if (!this.empty) {
                        this.found = response.found
                        this.is_id = response.is_id
                        this.is_url = response.is_url
                        this.complete = response.complete
                        this.options = response.options

                        if (this.complete && this.is_id) {
                            content_state.set_id(this.phrase)
                        }
                        if (this.complete && this.is_url) {
                            content_state.set_url(this.phrase)
                        }
                    }
                    m.redraw()
                })
                this._scheduled = false
            }, 300);
        }
    }
}

module.exports = {
    scheduler_state,
    content_state,
    search_state,
}