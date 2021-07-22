const m = require('mithril')

const url_regex = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)

const scheduler_state = {
    url: '',
    pristine: true,
    valid: false,
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
        }, 2000);
    },
    reset() {
        this.pristine = true
        this.valid = false
        this.url = ''
    },
}

const scheduler = {
    view() {
        return m('div', {class: 'scheduler'}, [
            m('h3', {class: 'scheduler__title'}, 'Submit your url'),
            m('div', {class: 'scheduler__input'}, [
                m('input', {
                    class: 'scheduler__field ' + (!scheduler_state.valid && !scheduler_state.pristine ? 'scheduler__field--invalid' : ''),
                    placeholder: 'https://example.com',
                    value: scheduler_state.url,
                    oninput(e) {
                        scheduler_state.set_url(e.target.value)
                    },
                }, ''),
                scheduler_state.waiting ? m('div', {
                    class: 'scheduler__spinner',
                }, '') : undefined,
                scheduler_state.success ? m('p', {
                    class: 'scheduler__success',
                }, 'url scheduled!') : undefined,
                scheduler_state.error ? m('p', {
                    class: 'scheduler__error',
                }, scheduler_state.message) : undefined,
                // TODO submit when button is clicked
                m('button', {
                    class: 'scheduler__submit', 
                    disabled: !scheduler_state.valid,
                    onclick(e) {
                        console.log(e)
                        e.preventDefault()
                        scheduler_state.status_waiting()
                        m.request({
                            method: 'POST',
                            url: '/benchmark',
                            body: {url: scheduler_state.url}
                        })
                        .then(() => {
                            scheduler_state.status_success()
                            scheduler_state.reset()
                        })
                        .catch((err) => scheduler_state.status_error(err.message))
                    }
                }, 'Run!'),
                // TODO feedback to user when response arrives
            ])
        ])
    }
}

let processing_data = []
socket.on('processing', (data) => {
    processing_data = data
    m.redraw()
})

function processing_item(item) {
    return m('li', {class: 'processing-item', key: item.id}, [
        m('div', {class: 'processing-item__info'}, [
            m('p', {class: 'processing-item__url'}, item.url),
            m('button', {class: 'processing-item__id'}, item.id), // TODO make id clickable and copy it to clipboard (change color on hover)
            m('p', {class: 'processing-item__started'}, item.started),
            m('p', {class: 'processing-item__scheduled'}, item.scheduled),
        ]),
        m('p', {class: 'processing-item__progress'}, [
            m('span', {class: 'processing-item__done'}, item.done),
            m('span', {class: 'processing-item__slash'}, '/'),
            m('span', {class: 'processing-item__size'}, item.size),
        ]),
    ])
}

const processing = {
    view() {
        return m('div', {class: 'processing'}, [
            m('h3', {class: 'processing__title'}, 'Processing'),
            m('ul', {class: 'processing__items'}, processing_data.map(processing_item)),
        ])
    }
}

let queue_data = []
socket.on('queue', (data) => {
    queue_data = data
    m.redraw()
})

function queue_item(item) {
    let show_copied = false // TODO message does not show up when button is clicked

    function show_message() {
        show_copied = true

        console.log(show_copied)
        console.log((show_copied ? m('p', {class: 'queue-item__copied'}, 'Copied to clipboard!') : undefined))

        setTimeout(() => {
            show_copied = false
            console.log(show_copied)
            console.log((show_copied ? m('p', {class: 'queue-item__copied'}, 'Copied to clipboard!') : undefined))
            m.redraw()
        }, 3000)
    }

    return m('li', {class: 'queue-item', key: item.id}, 
        m('div', {class: 'queue-item__content'}, [
            m('p', {class: 'queue-item__url'}, item.url),
            m('button', {class: 'queue-item__id', onclick: show_message}, item.id), // TODO make id clickable and copy it to clipboard (change color on hover)
            (show_copied ? m('p', {class: 'queue-item__copied'}, 'Copied to clipboard!') : undefined),
            m('p', {class: 'queue-item__scheduled'}, item.scheduled)
        ])
    )
}

const queue = {
    view() {
        return m('div', {class: 'queue'}, [
            m('h3', {class: 'queue__title'}, 'Queue'),
            m('ol', {class: 'queue__items'}, queue_data.map(queue_item)),
        ])
    }
}

module.exports = {
    view() {
        return m('div', {class: 'progress'}, [
            m('h2', {class: 'progress__title'}, 'Testing'),
            m(scheduler),
            m(processing),
            m(queue),
        ])
    }
}