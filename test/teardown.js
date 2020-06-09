var mongoose = require('mongoose');
const mongoUnit = require('mongo-unit');

    after(async () => {
      mongoose.disconnect();
      console.log("%% Stopping Server %%");
      var {stop} = require('../../server/bin/server');
      await stop();
      console.log("%% Stopping mongo unit %%");
      return mongoUnit.stop();
      })