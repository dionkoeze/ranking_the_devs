const {version, validate} = require('uuid')
const {model, Schema} = require('mongoose')

const TimeBenchmarkSchema = new Schema({
    time: {
        type: Number,
        required: [true, 'time measurement is required']
    },
}, {
    _id: false,
})

const AverageBenchmarkSchema = new Schema({
    n: {
        type: Number,
        required: [true, 'the size of the data n is required in a measurement'],
    },
    times: {
        type: [TimeBenchmarkSchema],
        default: [],
    },
}, {
    _id: false,
})

AverageBenchmarkSchema.virtual('average').get(function() {
    if (this.times.length === 0) return 0
    else return this.times.reduce((acc, cur) => acc + cur.time) / this.times.length
})

AverageBenchmarkSchema.virtual('variance').get(function() {
    if (this.times.length === 0) return 0
    else return this.times.reduce((acc, cur) => acc + cur.time * cur.time, 0) / this.times.length - this.average * this.average
})

const ScalingBenchmarkSchema = new Schema({
    error: {
        type: String,
    },
    scaling: {
        type: String,
        enum: {
            values: ['constant', 'logarithmic', 'linear', 'linear logarithmic', 'quadratic', 'cubic', 'exponential', 'factorial'],
            message: '{VALUE} is not a type of scaling',
        },
    },
    big_o: {
        type: String,
        enum: {
            values: ['1', 'log(n)', 'n', 'n*log(n)', 'n^2', 'n^3', '2^n', 'n!'],
            message: '{VALUE} is not a big O notation type'
        },
    },
    measurements: {
        type: [AverageBenchmarkSchema],
        default: [],
    },
}, {
    _id: false,
})

const ReportSchema = new Schema({
    id: {
        type: String,
        required: [true, 'id is required in report'],
        validate: {
            validator: (v) => validate(v) && version(v) === 4,
            message: (props) => `${props.value} is not a valid id (uuid v4)`,
        },
        index: true,
    },
    url: {
        type: String,
        required: [true, 'url is required in report'],
        index: true,
    },
    time: {
        type: Date,
        required: [true, 'starting time is required in report'],
    },
    error: {
        message: String,
    },
    benchmarks: {
        speed: {
            measurements: [Number],
            error: {
                message: String,
                expected: String,
                received: String,
            },
        },
    },
})

const Report = model('report', ReportSchema)

module.exports = Report