const m = require('mithril')

const scheduler = {
    view() {
        return m('div', {class: 'scheduler'}, [
            m('h3', {class: 'scheduler__title'}, 'Submit your url'),
            m('div', {class: 'scheduler__input'}, [
                // TODO input validation while typing
                m('input', {class: 'scheduler__field', placeholder: 'https://example.com'}, ''),
                // TODO submit when button is clicked
                m('button', {class: 'scheduler__submit', type: 'submit'}, 'Run!'),
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