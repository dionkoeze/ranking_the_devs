const {version, validate} = require('uuid')
const {model, Schema} = require('mongoose')

// scaling: {
//     type: String,
//     enum: {
//         values: ['constant', 'logarithmic', 'linear', 'linear logarithmic', 'quadratic', 'cubic', 'exponential', 'factorial'],
//         message: '{VALUE} is not a type of scaling',
//     },
// },
// big_o: {
//     type: String,
//     enum: {
//         values: ['1', 'log(n)', 'n', 'n*log(n)', 'n^2', 'n^3', '2^n', 'n!'],
//         message: '{VALUE} is not a big O notation type'
//     },
// },

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
            average: Number,
            stddev: Number,
            error: {
                message: String,
                expected: String,
                received: String,
            },
        },
    },
})

// ReportSchema.virtual('benchmarks.speed.average').get(function() {
//     console.log(this)
//     return average(this.measurements)
// })
// ReportSchema.virtual('benchmarks.speed.variance').get(function() {
//     return variance(this.measurements)
// })

ReportSchema.set('toObject', {virtuals: true})
ReportSchema.set('toJSON', {virtuals: true})

const Report = model('report', ReportSchema)

module.exports = Report