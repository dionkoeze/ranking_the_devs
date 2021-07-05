module.exports = (bus) => {
    bus.on('online', () => {
        bus.emit('update leaderboard')
    })

    bus.on('benchmark done', () => {
        bus.emit('update leaderboard')
    })
    
    bus.on('update leaderboard', () => {
        // TODO update all statistics

        bus.emit('leaderboard', [])
    })
}