# Ranking the devs plan

## Requirements

- It can perform a test on a url that is provided by a user. Scores of the tests (including improvements) are kept per url. Before a test is run it ascertains that the url hosts a backend that expects to be tested by sending a specific request that needs to be responded correctly. A restriction can be put on which kinds of urls are accepted for a test: for example only heroku hosted backends, to ensure equal hardware.
- A test uses randomized data, so there is no cheating by storing previous responses. The structure of the test should be similar, so the average difficulty is equal for all tests.
- Users can schedule a test on their backend. It keeps a queue of backends that are being tested. There is throttling in how many backends are tested simultaneously, so timing is not affected. Each url can be placed in the queue just once.
- Testing happens in stages, where each stage has the backend process more data. This produces an estimated or measured scaling of your implementation.
- There is a dashboard that shows the result of each test. A dashboard that shows the improvement per url. A dashboard that shows the currently top performing backends.
- Dashboards and queue are updated by push notifications.

## Design

### Development

The application is developed in one repo. The frontend app is hosted by the same node instance that performs the tests. This instance also sends all push notifications to all connected clients when new data is ready.

### Persistence

A mongo atlas instance is used to persist test reports. Partial test results are not persisted, only kept in memory while the test is running.

### Testing

Testing should be done in sequence. First a confirmation that it is a testable backend is sent. This has the following form and requires a response like that below. The response wants the random id echoed and confirmation that it accepts a test.
```json
Request: POST /benchmark
{
    "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

```json
Response
{
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "accepting": true
}
```

Testing further requires sequentially firing specific requests. 

Can this be done with dynamic promise chaining?

```js
const report = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    url: "http://example.com",
    error: "failed confirmation",
    benchmarks: {
        lookup: {
            error: {
                type: "wrong answer",
                type: "timeout",
                message: "...",
            },
        },
        sorted_range: {
            scaling: "logarithmic",
            big_o:  "O(log(n))",
            measurements: [
                {
                    n: 1,
                    average: 0.3235423,
                    variance: 0.054324,
                    times: [],
                    init_time: 1.4524342,
                }, {
                    n: 2,
                    average: 0.64283482,
                    variance: 0.0434544,
                    times: [],
                    init_time: 1.32134412,
                }
            ]
        },
        other_case: {
            measurements: [],
        }
    }
}

make_benchmark() // fires POST to /testing
    .then(lookup_test)
    .then(sorted_range_test)

function lookup_test() {

}

function lookup(data) {

}
```


### Test cases

Test cases should be randomly generated to avoid precomputation. The testing framework should be able to confirm a correct answer in less time than the tested backend needs to compute the correct answer. Otherwise we do not have enough performance. 

The only feasible solution is to generate an answer and scramble it to produce the input data for the backend. 

## Time planning