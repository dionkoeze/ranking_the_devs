const Report = require('./report')
const {version, validate} = require('uuid')

const projection = {
    _id: 0,
    url: 1, 
    id: 1, 
    time: 1
}

async function get_benchmark(id) {
    return await Report.findOne({id}, {_id: 0, __v: 0})
}

async function get_url(url) {
    return await Report
        .find({url}, projection)
        .sort({_id: -1}) // sorts by newest (fancy trick!)
}

async function get_search(phrase) {
    const regex = new RegExp(`${phrase}`)
    return await Report
            .find({$or: [{id: regex}, {url: regex}]}, projection) // search in ids and urls
            .sort({_id: -1}) // sorts by newest (fancy trick!)
            .limit(10)
}

async function search(phrase) {
    const options = await get_search(phrase)
    const is_id = (validate(phrase) && version(phrase) === 4)
    const is_url = !! options.find((option) => option.url === phrase)

    return {
        complete: is_id || is_url,
        found: (options.length > 0),
        is_id,
        is_url,
        options,
    }
}

module.exports = {
    get_benchmark,
    get_url,
    search,
}