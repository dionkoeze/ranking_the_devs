const queue = []
const processing = []

module.exports = (bus) => {
    function dispatch() {
        const url = dequeue()
        
        // TODO start benchmark of url
        
        bus.emit('update progress')
    }
    
    function schedule() {
        if (queue.length === 0) return
        
        // TODO check busy state
        
        // TODO dispatch next url if space
        dispatch()
    }
    
    function enqueue(url) {
        setImmediate(schedule)
        
        queue.push(url)

        console.log(`${url} scheduled`)
    }
    
    function dequeue() {
        return queue.shift()
    }

    bus.on('update progress', () => {
        bus.emit('processing state', processing.map(b => ({url: b.url, progress: b.progress})))
        bus.emit('queue state', queue)
    })

    bus.on('register url', (req) => {
        if (queue.indexOf(req) === -1) {
            enqueue(req)
            console.log(req.id)
            bus.emit(req.id, true)
        } else {
            bus.emit(req.id, false)
        }
    })

    bus.on('benchmark done', () => {
        bus.emit('update progress')
        schedule()
    })
}
