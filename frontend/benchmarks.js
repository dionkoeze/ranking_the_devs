const m = require('mithril')

module.exports = {
    view() {
        return m('div', {class: 'benchmarks'}, [
            m('h2', {class: 'benchmarks__title'}, 'Benchmarks'),

        ])
    }
}