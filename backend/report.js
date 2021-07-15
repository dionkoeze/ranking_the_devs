const {version, validate} = require('uuid')
const {model, Schema} = require('mongoose')

const MeasurementSchema = new Schema({
    n: {
        type: Number,
        required: [true, 'the size of the data n is required in a measurement'],
    },
    times: {
        type: [Number],
        default: [],
    },
}, {
    _id: false,
})

MeasurementSchema.virtual('average').get(function() {
    if (this.times.length === 0) return 0
    else return this.times.reduce((acc, cur) => acc + cur) / this.times.length
})

MeasurementSchema.virtual('variance').get(function() {
    if (this.times.length === 0) return 0
    else return this.times.reduce((acc, cur) => acc + cur * cur, 0) / this.times.length - this.average * this.average
})

const BenchmarkSchema = new Schema({
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
        type: [MeasurementSchema],
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
    },
    url: {
        type: String,
        required: [true, 'url is required in report']
    },
    benchmarks: {
        lookup: BenchmarkSchema,
        range: BenchmarkSchema,
        other: BenchmarkSchema,
        // more benchmarks to follow
    }
})

const Report = model('report', ReportSchema)

function empty_report() {
    const report = new Report()

    report.benchmarks.lookup = {
        data_source : 'example_data',
        sample_size : 20,
    }

    report.benchmarks.range = {
        data_source : 'example_data',
        sample_size : 10,
    }

    report.benchmarks.other = {
        data_source : 'other_data',
        sample_size : 15,
    }

    return report
}

module.exports = {
    Report,
    empty_report,
}