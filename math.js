function average(values) {
    if (!values) return 0
    if (values.length === 0) return 0
    return values.reduce((acc, cur) => acc + cur) / values.length
}

function variance(values) {
    if (!values) return 0
    if (values.length === 0) return 0
    return values.reduce((acc, cur) => acc + cur * cur, 0) / values.length - average(values) ** 2
}

function stddev(values) {
    return Math.sqrt(variance(values))
}

function round(value, decimals = 0) {
    return Math.round((value + Number.EPSILON) * 10 ** decimals) / 10 ** decimals
}

function numbers(end, start = 1) {
    const result = []

    for (let i = start; i <= end; i++) {
        result.push(i)
    }

    return result
}

module.exports = {
    average,
    variance,
    stddev,
    round,
    numbers,
}