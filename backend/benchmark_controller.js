const uuid = require('uuid').v4
const router = require('express').Router()

// only scheduling is done through REST api, as we want meaningful errors
module.exports = (bus) => {
    // TODO implement exponential backoff!
    router.post('/benchmark', (req, res) => {
        // TODO check for url with regex
        if (typeof req.body.url !== 'string') {
            res.status(400).json(`not a valid url`)
            return 
        }

        const id = uuid()

        bus.once(`scheduled ${id}`, (success) => {
            if (success) res.status(201).end()
            else res.status(300).json('already scheduled')
        })

        bus.emit('register url', {
            id,
            url: req.body.url
        })
    })

    return router
}