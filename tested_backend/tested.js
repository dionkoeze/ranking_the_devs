const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const morgan = require('morgan')

app.use(morgan('combined'))
app.use(express.json())

app.post('/benchmark', (req, res) => {
    res.status(201).json({
        id: req.body.id,
        accepting: true,
    })
})

let n = 1

app.post('/data', (req, res) => {
    n = req.body.n
    res.status(201).end()
})

const endpoints = [{
    scaling: 'constant',
    delay: () => 1,
}, {
    scaling: 'logarithmic',
    delay: () => log(n),
}, {
    scaling: 'linear',
    delay: () => n,
}, {
    scaling: 'quadratic',
    delay: () => n**2,
}, {
    scaling: 'cubic',
    delay: () => n**3,
}, {
    scaling: 'exponential',
    delay: () => 2**n,
}]

for (let endpoint of endpoints) {
    app.get(`/${endpoint.scaling}`, (req, res) => {
        setTimeout(() => {
            res.status(200).json({
                scaling: endpoint.scaling,
            })
        }, endpoint.delay());
    })
}


const port = process.env.PORT || 4321
server.listen(port, () => {
    console.log(`listening on *:${port}`)
})