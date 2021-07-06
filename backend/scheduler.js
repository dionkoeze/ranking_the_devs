const uuid = require('uuid').v4

const queue = [{
    id: uuid(),
    url: 'https://example.com',
    scheduled: new Date(),
}, {
    id: uuid(),
    url: 'http://examp.le',
    scheduled: new Date(),
},{
    id: uuid(),
    url: 'https://example.com',
    scheduled: new Date(),
}, {
    id: uuid(),
    url: 'http://examp.le',
    scheduled: new Date(),
},{
    id: uuid(),
    url: 'https://example.com',
    scheduled: new Date(),
}, {
    id: uuid(),
    url: 'http://examp.le',
    scheduled: new Date(),
},{
    id: uuid(),
    url: 'https://example.commmmmmmmmmmmmmmmmmmmm.commmmmmmmmmmm',
    scheduled: new Date(),
}, {
    id: uuid(),
    url: 'http://examp.le',
    scheduled: new Date(),
},{
    id: uuid(),
    url: 'https://example.com',
    scheduled: new Date(),
}, {
    id: uuid(),
    url: 'http://examp.le',
    scheduled: new Date(),
},{
    id: uuid(),
    url: 'https://example.com',
    scheduled: new Date(),
}, {
    id: uuid(),
    url: 'http://examp.le',
    scheduled: new Date(),
}]
const processing = [{
    id: uuid(),
    url: 'https://example2.commmmmmmmmmmm.com',
    scheduled: new Date(),
    started: new Date(),
    done: 15,
    size: 24,
}, {
    id: uuid(),
    url: 'http://ex.nl',
    scheduled: new Date(),
    started: new Date(),
    done: 2,
    size: 24,
}]

module.exports = (bus) => {
    // function dispatch() {
    //     const url = dequeue()
        
    //     // TODO start benchmark of url
        
    //     bus.emit('update progress')
    // }
    
    // function schedule() {
    //     // TODO emit queue and processing events when queue or processing is empty

    //     if (queue.length === 0) return
        
    //     // TODO check busy state
        
    //     // TODO dispatch next url if space
    //     dispatch()
    // }
    
    // function enqueue(url) {
    //     setImmediate(schedule)
        
    //     queue.push(url)

    //     console.log(`${url} scheduled`)
    // }
    
    // function dequeue() {
    //     return queue.shift()
    // }

    bus.on('update progress', () => {
        // TODO append processing state with EMPTY spots, so it shows up in frontend
        bus.emit('processing state', processing.map(item => ({
            id: item.id,
            url: item.url.replace('http://', '').replace('https://', ''),
            done: item.done,
            size: item.size,
            scheduled: item.scheduled,
            started: item.started,
        })))
        bus.emit('queue state', queue.map(item => ({
            ...item,
            url: item.url.replace('http://', '').replace('https://', ''),
        })))
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
        // TODO update queue and processing arrays

        bus.emit('update progress')
        schedule()
    })

    bus.on('online', () => {
        bus.emit('update progress')
    })
}
