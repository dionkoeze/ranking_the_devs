const {performance} = require('perf_hooks')
const axios = require('axios')
const lm = require('ml-levenberg-marquardt')

const { empty_report } = require('./report')

const sample_sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600]

function determine_big_o(ns, times) {

}

const lookup = {

}

const range = {

}

const other = {

}

const generators = {
    lookup,
    range,
    other,
}

class BenchmarkRunner {
    constructor(url, id, benchmark, report) {
        this.id = id
        this.benchmark = benchmark
        this.generator = generators[benchmark]
        this.report = report
        this.benchmark = this.report.benchmarks[this.benchmark]
        this.axios = axios.create({
            baseURL: url,
            timeout: 10000,
        })
        this.progress = 0
    }

    stop() {
        this.progress = this.size
    }

    async run(cb) {
        for (let n of sample_sizes) {
            const {data_url, data, req_url, requests, corrects} = await this.generator(n)

            const init_start = performance.now()
            try {
                await this.axios.post(data_url, data)
            } catch (error) {
                this.benchmark.error = error.message
                await this.report.save()
                return this.stop()
            }
            const init_end = performance.now()

            this.benchmark.measurements.push({
                init_time : init_end - init_start,
                n,
                times: [],
            })
            
            await this.report.save()

            this.progress += 1

            // give benchmarking an opportunity to emit events on the bus
            cb()

            // the number of requests determines the statistical sample size
            for (let i = 0; i < requests.length; i++) {
                const request = requests[i]
                const correct = corrects[i]

                const start = performance.now()
                const response = await this.axios.get(req_url, {params: request})
                const end = performance.now()
    
                if (JSON.stringify(response) === JSON.stringify(correct)) {
                    this.benchmark.measurements[this.benchmark.measurements - 1].times.push(end - start)
                    
                    await this.report.save()
                    
                    this.progress += 1
                } else {
                    this.benchmark.error = `incorrect answer: expected ${correct}, received ${response}`

                    await this.report.save()

                    return this.stop()
                }

                // give benchmarking an opportunity to emit events on the bus
                cb()
            }
        }

        // TODO determine scaling and save to db

        this.progress += 1
    }

    get size() {
        return sample_sizes.length + 2 // +1 for initializing data, +1 for determining scaling
    }

    get done() {
        return this.progress
    }
}

module.exports = (bus) => {
    bus.on('start test', (handle) => {
        const report = empty_report()
        report.id = handle.id
        report.url = handle.url
        
        // TODO send request to confirm expecting benchmark
        try {
            const confirmation = this.axios.post('/benchmark', {id: this.id})
            if (confirmation.id !== handle.id) throw Error("replied with incorrect id")
            if (!confirmation.accepting) throw Error("backend is not accepting")
        } catch (error) {
            report.error = `failed confirmation: ${error.message}`
            bus.emit('test done', handle.id)
            return
        }

        const benchmarks = []

        // loop over properties in schema (mongoose defines more)
        for (let benchmark in report.benchmarks) {
            if (report.benchmarks.hasOwnProperty(benchmark)) {
                console.log(benchmark)
                if (benchmark in generators) {
                    benchmarks.push(new BenchmarkRunner(handle.url, handle.id, benchmark, report))
                } else {
                    console.error(`${benchmark} is not found`)
                }
            }
        }

        setImmediate(async () => {
            for (let benchmark of benchmarks) {
                await benchmark.run(() => bus.emit('update progress'))
            }
            bus.emit('test done', handle.id)
        })

        Object.defineProperty(handle, 'size', {
            get() {
                return benchmarks.reduce((acc, cur) => acc + cur.size, 0)
            }
        })

        Object.defineProperty(handle, 'done', {
            get() {
                return benchmarks.reduce((acc, cur) => acc + cur.done, 0)
            }
        })
    })
}
