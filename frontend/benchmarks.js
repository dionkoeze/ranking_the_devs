const m = require('mithril')

const {search_state, content_state} = require('./state')

const {Chart, LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement} = require('chart.js')
Chart.register(LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement)

const {round} = require('../math')

const { vertical_bar_chart, update_data } = require('./chart_configs')

function make_option(option) {
    return m('li', {class: 'option'}, [
        m('button', {
            class: 'option__url', 
            onclick() {
                search_state.set_value(option.url)
            },
        }, option.url),
        m('button', {
            class: 'option__id',
            onclick() {
                search_state.set_value(option.id)
            },
        }, option.id),
        m('p', {class: 'option__time'}, new Date(option.time).toLocaleString()),
    ])
}

const search = {
    view() {
        return m('div', {class: 'search'}, [
            search_state.waiting ? m('div', {
                class: 'search__spinner',
            }, '') : m('div', {class: 'search__empty'}),
            m('input', {
                class: 'search__field' + (!search_state.empty && !search_state.found ? ' search__field--not-found' : '') + (search_state.found ? ' search__field--found' : '') + (search_state.complete ? ' search__field--complete' : ''),
                placeholder: 'url or benchmark id',
                value: search_state.phrase,
                oninput(e) {
                    search_state.set_value(e.target.value)
                }
            }),
            !search_state.empty ? m('button', {
                class: 'search__clear',
                onclick() {
                    search_state.set_value('')
                    content_state.clear()
                },
            }, 'x') : m('div', {class: 'search__empty'}),
            m('ul', {class: 'search__results'}, search_state.complete ? [] : search_state.options.map(make_option))
        ])
    }
}

function make_benchmark_entry(option) {
    return m('li', {class: 'entry'}, [
        m('p', {class: 'entry__time'}, new Date(option.time).toLocaleString()),
        m('button', {
            class: 'entry__id',
            onclick() {
                search_state.set_value(option.id)
            },
        }, option.id),
    ])
}

const url_content = {
    view() {
        return m('ul', {class: 'entries'}, content_state.url.map(make_benchmark_entry))
    },
}

const benchmark_info = {
    view(vnode) {
        return m('div', {class: 'benchmark-item info'}, [
            m('button', {
                class: 'info__url', 
                onclick() {
                    search_state.set_value(vnode.attrs.info.url)
                },
            }, vnode.attrs.info.url),
            m('p', {class: 'info__id'}, vnode.attrs.info.id),
            m('p', {class: 'info__time'}, new Date(vnode.attrs.info.time).toLocaleString()),
        ])
    }
}

const average_chart = {
    oncreate(vnode) {
        const ctx = vnode.dom.getContext('2d')
        this.chart = new Chart(ctx, vertical_bar_chart)
    },
    onupdate(vnode) {
        update_data(this.chart, vnode.attrs.data, {backgroundColor: '#247BA0'})
    },
    view() {
        return m('canvas[height=220em]', {
            class: 'average__plot',
        })
    },
}

const average = {
    view(vnode) {
        return m('div', {class: 'benchmark-item average'}, [
            m('p', {class: 'average__name'}, vnode.attrs.data.name),
            m(average_chart, {data: vnode.attrs.data.measurements}),
            m('p', {class: 'average__value'}, [
                m('span', round(vnode.attrs.data.average)),
                ' ± ',
                m('span', round(vnode.attrs.data.stddev, 1)),
                ' ms',
            ]),
        ])
    }
}

const benchmark_content = {
    view() {
        return m('div', {class: 'benchmark'}, [
            m(benchmark_info, {info: content_state.info}),
            m(average, {data: content_state.get_benchmark('speed')}),
        ])
    },
}

module.exports = {
    view() {
        return m('div', {class: 'benchmarks'}, [
            m('h2', {class: 'benchmarks__title'}, 'Benchmarks'),
            m(search),
            m('div', {class: 'content'}, [
                content_state.is_id ? m(benchmark_content) : undefined,
                content_state.is_url ? m(url_content) : undefined,
            ])
        ])
    }
}