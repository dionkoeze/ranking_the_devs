const m = require('mithril')

const {scheduler_state, search_state} = require('./state')

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
                m('button', {
                    class: 'scheduler__submit', 
                    disabled: !scheduler_state.valid,
                    onclick(e) {
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
                        .catch((err) => {
                            scheduler_state.status_error(err.message)
                            // scheduler_state.reset()
                        })
                    }
                }, 'Run!'),
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
            m('button', {
                class: 'processing-item__id',
                onclick() {
                    search_state.set_value(item.id)
                },
            }, item.id),
            m('p', {class: 'processing-item__started'}, item.started ? new Date(item.started).toLocaleString() : ''),
            m('p', {class: 'processing-item__scheduled'}, item.scheduled ? new Date(item.scheduled).toLocaleString() : ''),
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
    return m('li', {class: 'queue-item', key: item.id}, 
        m('div', {class: 'queue-item__content'}, [
            m('p', {class: 'queue-item__url'}, item.url),
            m('button', {
                class: 'queue-item__id', 
                onclick() {
                    search_state.set_value(item.id)
                },
            }, item.id), // TODO make id clickable and copy it to clipboard (change color on hover)
            m('p', {class: 'queue-item__scheduled'}, new Date(item.scheduled).toLocaleString())
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