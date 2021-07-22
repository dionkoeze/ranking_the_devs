// const queue = [{
//     id: uuid(),
//     url: 'https://example.com',
//     scheduled: new Date(),
// }, {
//     id: uuid(),
//     url: 'http://examp.le',
//     scheduled: new Date(),
// },{
//     id: uuid(),
//     url: 'https://example.com',
//     scheduled: new Date(),
// }, {
//     id: uuid(),
//     url: 'http://examp.le',
//     scheduled: new Date(),
// },{
//     id: uuid(),
//     url: 'https://example.com',
//     scheduled: new Date(),
// }, {
//     id: uuid(),
//     url: 'http://examp.le',
//     scheduled: new Date(),
// },{
//     id: uuid(),
//     url: 'https://example.commmmmmmmmmmmmmmmmmmmm.commmmmmmmmmmm',
//     scheduled: new Date(),
// }, {
//     id: uuid(),
//     url: 'http://examp.le',
//     scheduled: new Date(),
// },{
//     id: uuid(),
//     url: 'https://example.com',
//     scheduled: new Date(),
// }, {
//     id: uuid(),
//     url: 'http://examp.le',
//     scheduled: new Date(),
// },{
//     id: uuid(),
//     url: 'https://example.com',
//     scheduled: new Date(),
// }, {
//     id: uuid(),
//     url: 'http://examp.le',
//     scheduled: new Date(),
// }]
// const processing = [{
//     id: uuid(),
//     url: 'https://example2.commmmmmmmmmmm.com',
//     scheduled: new Date(),
//     started: new Date(),
//     done: 15,
//     size: 24,
// }, {
//     id: uuid(),
//     url: 'http://ex.nl',
//     scheduled: new Date(),
//     started: new Date(),
//     done: 2,
//     size: 24,
// }]

const queue = []
const processing = []

module.exports = (bus) => {
    function dispatch() {
        const handle = dequeue()

        handle.started = new Date()
        
        processing.push(handle)
        bus.emit('update progress')
        
        bus.emit('start test', handle)
    }
    
    function schedule() {
        if (queue.length === 0) return

        if (processing.length < process.env.PARAMS_PROCESSING) {
            dispatch()
            bus.emit('update progress')
        }
    }
    
    function enqueue(req) {
        setImmediate(schedule)
        
        queue.push({
            ...req,
            scheduled: new Date(),
        })

        console.log(`${req.url} scheduled`)
    }
    
    function dequeue() {
        return queue.shift()
    }

    function pad_end(processing) {
        while (processing.length < process.env.PARAMS_PROCESSING) {
            processing.push({
                url: "empty",
                id: "",
                done: "-",
                size: "-",
                scheduled: "",
                started: "",
            })
        }

        return processing
    }

    bus.on('update progress', () => {
        // TODO append processing state with EMPTY spots, so it shows up in frontend
        const cleansed_processing = processing.map(item => ({
            id: item.id,
            url: item.url.replace('http://', '').replace('https://', ''),
            done: item.done,
            size: item.size,
            scheduled: item.scheduled,
            started: item.started,
        }))
        bus.emit('processing state', pad_end(cleansed_processing))
        bus.emit('queue state', queue.map(item => ({
            ...item,
            url: item.url.replace('http://', '').replace('https://', ''),
        })))
    })

    bus.on('register url', (req) => {
        if (queue.indexOf(req) === -1) {
            enqueue(req)
            bus.emit(`scheduled ${req.id}`, true)
        } else {
            bus.emit(`scheduled ${req.id}`, false)
        }
    })

    bus.on('test done', (id) => {
        // TODO update queue and processing arrays

        bus.emit('update progress')
        schedule()
    })

    bus.on('online', () => {
        bus.emit('update progress')
    })
}
