const {model, Schema} = require('mongoose')

const ReportSchema = new Schema({
    url: {
        type: String,
        required: [true, 'url is required in report']
    },
})

const Report = model('report', ReportSchema)

module.exports = Report