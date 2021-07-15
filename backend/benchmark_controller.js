const uuid = require('uuid').v4
const router = require('express').Router()

// only scheduling is done through REST api, as we want meaningful errors
module.exports = (bus) => {
    router.post('/benchmark', (req, res) => {
        // TODO check for url with regex
        if (typeof req.body.url !== 'string') {
            res.status(400).send('url should be a url')
        }

        const id = uuid()

        console.log({
            id, 
            url: req.body.url,
        })

        bus.once(`scheduled ${id}`, (success) => {
            console.log(id, success)
            if (success) res.status(201).end()
            else res.status(300).send('url already scheduled')
        })

        bus.emit('register url', {
            id,
            url: req.body.url
        })
    })

    return router
}