const { populate } = require('./populate-api-test-data');

before(async () => {
      await populate();
      console.log(process.env.DEV_DB_HOST);
      var {start} = require('../../server/bin/server');
      start();
      console.log('all done populating');
})