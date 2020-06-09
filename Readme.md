### Api tests with Mocha, Chai, Supertest and Mongo Unit

We started writing tests with Mocha, Supertest and Chai. We were talking to the dev mongo-db instance initially to get the protype working which looked like this
```
describe('GET count api', function () {
    var new_token = createToken({id:'5ec1450b27c59b7512ba46ce'}); // hardcoded for now
    it('should contain correct response data', function(done) {
        api.get('/api/beacons/count')
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token)
            .expect(200)
            .then(response => {
              console.log("",response);
              assert.isAbove(response.body.count , 0, "Count is: ${response.body.count}");
            done();
            })
     });
});
```
#### The problem with this approach?
The tests written in this fashion relied on a dev mongo db instance(which is a server sitting in a  tiny room). If that server crashes, I cant run the tests!

#### The solution:
There was a need to mock data. we explored couple of options and then decided to use mongo-unit.
The steps in the nutshell are:
1. start the mongo-unit 
2. populate all the test data in mongo-unit & spin up the server. This is done in the /test/startup.js script along with starting the server).
Note: Always check that the tests are talking to the test mongo-unit and not the dev mongo db instance. 
3. Run tests
4. Run the teardown script(/test/teardown.js) that tears down the mongo unit and the server.

To run the tests:
```
cd {project-folder}
npm i
npm run test
```


###### This is the script that gets called:
` "test": "cd tests &&  mocha 'test/**/*.js' --require test/mongo-helper --file ./test/startup.js --file ./test/teardown.js --exit",`

where,
--require `test/mongo-helper` makes sure that the mongo-unit required for test spins up first, 
This starts mongo-unit( //mongodb://localhost:27017/test)
--file `./test/startup.js` - populates database data and most importantly starts up the server that then connects to the above mongo-unit
--`./test/teardown.js` tears down the mongo unit and the server
-- `exit `is used to forcefully kill mocha tests. I saw an issue where the tests were not exiting correctly on failure and this seemed the easiest workaround.

#### Integration with Circle CI
Getting everything running on Circle CI was really straightworfard.
Check the circle.ci/config.yaml for more details.

![Workflow_ApiTests](/Workflow_ApiTests.png)

![Passing_ApiTests](/Passing_ApiTests.png)

##### To do:
1. In future I may split the single job into two, one to build and start the server and the next one to run the cypress tests.
2. Saving and Restoring caches which should speed up the pipeline job. I am on a free Circle CI trial so every minute that can be saved is good :)
