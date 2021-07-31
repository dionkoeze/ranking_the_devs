const axios = require('axios')
const {Node} = require('./node')

class ConfirmationError extends Error {
    constructor(...params) {
        super(...params)

        if (Error.captureStackTrace) Error.captureStackTrace(this, ConfirmationError)

        this.name = 'ConfirmationError'
    }
}

function create_confirmation_node(handle, report, children = []) {
    return new Node(handle.id, children, {
        async before() {
            const confirmation = await axios.post(`${handle.url}/benchmark`, {id: handle.id})
    
            if (confirmation.data.id !== handle.id) throw new ConfirmationError("replied with incorrect id")
            if (!confirmation.data.accepting) throw new ConfirmationError("backend is not accepting")
        },
        async error(err) {
            if (err instanceof ConfirmationError) {
                report.error = `failed confirmation: ${err.message}`
                await report.save()
            } else {
                throw err
            }
        },
    })
}

module.exports = {
    create_confirmation_node,
    ConfirmationError,
}