const {numbers} = require('../math')

function update_data(chart, data, options) {
    console.log(chart, data, options)

    if (!data) {
        console.log('first')
        chart.data = {}
        chart.update()
    } else if (!chart.data.datasets[0] || JSON.stringify(data) != JSON.stringify(chart.data.datasets[0].data)) {
        console.log('second')
        chart.data = {
            labels: numbers(data.length),
            datasets: [{
                data,
                // backgroundColor: '#247BA0',
                ...options,
            },],
        }
        chart.update()
    }
}

const vertical_bar_chart = {
    type: 'bar',
    options: {
        responsive: true,
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'time [ms]',
                },
                beginAtZero: true,
            },
            x: {
                title: {
                    display: true,
                    text: 'measurement',
                },
            },
        },
    },
}

module.exports = {
    vertical_bar_chart,
    update_data,
}