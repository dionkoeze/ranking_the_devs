# Ranking the devs plan

## Requirements

- It can perform a test on a url that is provided by a user. Scores of the tests (including improvements) are kept per url. Before a test is run it ascertains that the url hosts a backend that expects to be tested by sending a specific request that needs to be responded correctly. A restriction can be put on which kinds of urls are accepted for a test: for example only heroku hosted backends, to ensure equal hardware.
- A test uses randomized data, so there is no cheating by storing previous responses. The structure of the test should be similar, so the average difficulty is equal for all tests.
- Users can schedule a test on their backend. It keeps a queue of backends that are being tested. There is throttling in how many backends are tested simultaneously, so timing is not affected. Each url can be placed in the queue just once.
- Testing happens in stages, where each stage has the backend process more data. This produces an estimated or measured scaling of your implementation.
- There is a dashboard that shows the result of each test. A dashboard that shows the improvement per url. A dashboard that shows the currently top performing backends.
- Dashboards and queue are updated by push notifications.

## Design

The application is developed in one repo. The frontend app is hosted by the same node instance that performs the tests. This instance also sends all push notifications to all connected clients when new data is ready.

A mongo atlas instance is used to persist test reports. Partial test results are not persisted, only kept in memory while the test is running.

## Time planning