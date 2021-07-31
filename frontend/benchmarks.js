const m = require('mithril')

const {search_state, content_state} = require('./state')

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

const benchmark_item = {
    view(vnode) {
        return m('div', {class: 'benchmark-item'}, [
            m('p', {class: 'benchmark-item__msg'}, vnode.attrs.msg),
        ])
    }
}

const benchmark_item_2 = {
    view(vnode) {
        return m('div', {class: 'benchmark-item-2'}, [
            m('p', {class: 'benchmark-item__msg'}, vnode.attrs.msg),
        ])
    }
}

const benchmark_content = {
    view() {
        return m('div', {class: 'benchmark'}, [
            // JSON.stringify(content_state.benchmark)
            m(benchmark_item, {msg: 'item 1'}),
            m(benchmark_item_2, {msg: 'item 2'}),
            m(benchmark_item, {msg: 'item 3'}),
            m(benchmark_item, {msg: 'item 4'}),
            m(benchmark_item_2, {msg: 'item 5'}),
            m(benchmark_item, {msg: 'item 6'}),
            m(benchmark_item, {msg: 'item 7'}),
            m(benchmark_item, {msg: 'item 8'}),
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