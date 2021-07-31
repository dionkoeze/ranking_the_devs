let bus

function init(newbus) {
    bus = newbus
}

// Benchmarks live in trees. Each node in the tree is visited in left depth-first order. 
// A visited node is requested to run itself (before and after hook) and optionally pass data 
// to the parent. The parent receives the data in an array in the after hook.
class Node {
    constructor(id, children, {before = undefined, after = undefined, error = undefined} = {}) {
        this.id = id
        this.children = children
        
        this.before_done = true
        this.after_done = true

        if (typeof error == 'function') {
            this.error = error
        }

        if (typeof before == 'function') {
            this.before = before
            this.before_done = false
        }
        if (typeof after == 'function') {
            this.after = after
            this.after_done = false
        }
    }

    async run() {
        let result_before

        if (this.before) {
            try {
                result_before = await this.before()
            } catch (err) {
                if (this.error) await this.error(err)
                else throw err
            }
            this.before_done = true
            bus.emit('update progress')
            bus.emit(this.id)
        }

        let results = []
        for (let child of this.children) {
            try {
                const result = await child.run()
                if (result !== undefined) {
                    results.push(result)
                }
            } catch (err) {
                if (this.error) {
                    await this.error(err)
                }
                else throw err
            }
            bus.emit('update progress')
            bus.emit(this.id)
        }

        if (this.after) {
            try {
                results = await this.after(results, result_before)
            } catch (err) {
                if (this.error) await this.error(err)
                else throw err
            }
            this.after_done = true
            bus.emit('update progress')
            bus.emit(this.id)
        }

        return results
    }

    size() {
        return this.children.reduce((acc, cur) => acc + cur.size(), 0) + (!!this.before) + (!!this.after)
    }

    done() {
        return this.children.reduce((acc, cur) => acc + cur.done(), 0) + (!!this.before && this.before_done) + (!!this.after && this.after_done)
    }
}

module.exports = {
    init,
    Node,
}