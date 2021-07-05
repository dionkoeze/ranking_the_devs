const m = require('mithril')

module.exports = {
    view() {
        return m('div', {class: 'leaderboard'}, [
            m('h2', {class: 'leaderboard__title'}, 'Leaderboard')
        ])
    }
}