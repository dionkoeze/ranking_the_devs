const uuid = require('uuid').v4
const axios = require('axios')

module.exports = (bus) => {
    class BenchmarkPart {
        constructor(config, children) {
            this.config = config
            this.children = children
            this.done = false
        }
    
        get size() {
            return this.children.reduce((acc, child) => acc + child.size, 0)
        }
    
        get progress() {
            return this.children.reduce((acc, child) => acc + child.done, 0)
        }
    
        async run(url) {
            const request = await this.config.test()
            if (request != null) {
                axios.request({
                    ...request,
                    url: `${url}/${request.url}`,
                })
            }
    
            this.config.result = []
    
            for (let child of this.children) {
                const start = new Date()
                const result = await child.run()
                const end = new Date()
                this.config.result.push({
                    ...result,
                    time: end - start,
                })
            }
    
            this.done = true
            bus.emit('update progress')
    
            return this.config.report()
        }
    }
    
    class Benchmark {
        constructor(url, root) {
            this.url = url
            this.root = root
        }

        async check_accepting(nonce) {
            const response = await axios.post(`${url}/benchmark`, nonce)
            return nonce === response
        }

        async run(id) {
            if (await this.check_accepting(id)) {
                await this.root.run(this.url)

                // TODO store benchmark in database (id, time)
            } else {
                // TODO store failure in database (id, time)
            }
            
            bus.emit('benchmark done')
        }
    }
}



// class SortStage {
//     constructor() {

//     }

//     async init() {

//     }

//     get name() {

//     }

//     get data() {

//     }

//     get endpoint() {

//     }

//     get params() {

//     }

//     async process(response, report) {

//     }
// }

// module.exports = (bus) => {
//     class Benchmark {
//         constructor(url, stages) {
//             this.stages = stages
//             this.done = 0
//             this.report = {
//                 url,
//                 status: {
//                     label: 'running',
//                     success: false,
//                 },
//                 stages: {},
//             }
//         }

//         get progress() {
//             return `${this.done} / ${this.stages.length}`
//         }

//         async check_accepting() {
//             const nonce = uuid()
//             const response = await axios.post(`${url}/benchmark`, nonce)
//             return nonce === response
//         }
    
//         async run() {
//             if (!await check_accepting()) {
//                 this.done = this.stages.length

//                 this.report.success = {
//                     label: 'failed',
//                     success: false,
//                     reason: 'url does not expect benchmark',
//                 }

//                 bus.emit('benchmark done')
                
//                 return
//             }

//             for (let stage of this.stages) {
//                 // set stage name in report object

//                 await stage.init()
//                 await axios.post(`${url}/data`, stage.data)
//                 const response = await axios.get(`${url}/${stage.endpoint}`, {params: stage.params})
//                 const result = await stage.check(response)
//                 this.report.stages[stage.name] = result // TODO this does not handle scaling testing...?
//                 // TODO update report with process function of stage

//                 this.done += 1

//                 bus.emit('update progress')
//             }

//             bus.emit('benchmark done')
//         }
//     }
// }