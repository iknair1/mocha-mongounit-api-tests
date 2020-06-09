const prepare = require('mocha-prepare')
const mongoUnit = require('mongo-unit')

prepare(done => mongoUnit.start()
 .then(testMongoUrl => {
   //mongodb://localhost:27017/test
   process.env.DEV_DB_HOST = 'localhost';
   process.env.DEV_DB_PORT = 27017;
   process.env.DEV_DB_NAME = 'test';
   process.env.PORT = 8181;
   done()
 }))



