const lm = require('ml-levenberg-marquardt')
const axios = require('axios')

const Report = require('./report')

const {Node} = require('./benchmarks/node')
const {create_confirmation_node} = require('./benchmarks/confirmation')
const {create_average_stopwatch, IncorrectResponseError} = require('./benchmarks/stopwatch')

const {average, stddev} = require('../math')


module.exports = (bus) => {
    require('./benchmarks/node').init(bus)

    bus.on('start test', async (handle) => {
        const report = new Report()
        report.id = handle.id
        report.url = handle.url
        report.time = new Date()

        // save initial data and let clients know this benchmark now exists
        await report.save()
        bus.emit(handle.url)

        // TODO build up benchmarking tree here
        const requests = new Array(10)
        requests.fill({}, 0, 10)
        const expecteds = new Array(10)
        expecteds.fill({scaling: 'quadratic'}, 0, 10)
        const average_stopwatch_node = create_average_stopwatch(handle, 'quadratic', requests, expecteds)

        const average_node = new Node(handle.id, [average_stopwatch_node], {
            async after(results) {
                report.benchmarks.speed.measurements = results[0]
                report.benchmarks.speed.average = average(results[0])
                report.benchmarks.speed.stddev = stddev(results[0])
                await report.save()
            },
            async error(err) {
                if (err instanceof IncorrectResponseError) {
                    report.benchmarks.speed.error.message = err.message
                    report.benchmarks.speed.error.expected = err.expected
                    report.benchmarks.speed.error.received = err.received
                    await report.save()
                } else {
                    throw err
                }
            },
        })

        const set_data_node = new Node(handle.id, [], {
            async after() {
                await axios.post(`${handle.url}/data`, {n: 40})
            },
        })

        const confirmation_node = create_confirmation_node(handle, report, [set_data_node, average_node])
    
        const root = new Node(handle.id, [confirmation_node])

        setImmediate(async () => {
            await root.run()

            bus.emit('test done', handle.id)
        })

        Object.defineProperty(handle, 'size', {
            get() {
                return root.size()
            }
        })

        Object.defineProperty(handle, 'done', {
            get() {
                return root.done()
            }
        })
    })
}
