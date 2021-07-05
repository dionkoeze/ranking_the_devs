const m = require('mithril')

module.exports = {
    view() {
        return m('div', {class: 'title'}, [
            m('h1', {class: 'title__main'}, 'Ranking the devs'),
            m('p', {class: 'title__sub'}, 'Compete for efficiency'),
            m('p', {class: 'title__credits'}, [
                m('span', 'By '),
                m('a', {href: 'https://github.com/dionkoeze', class: 'title__link'}, 'Dion Koeze'),
                m('span', ' for the ADS course at Informatica Avans Breda'),
            ]),
        ])
    }
}