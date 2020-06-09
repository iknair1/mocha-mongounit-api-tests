var should = require('chai').should(),
    expect = require('chai').expect,
    assert = require('chai').assert,
    supertest = require('supertest'),
    api = supertest('http://localhost:8181');
var mongoose = require('mongoose');
const { getTokenForUser, getUser} = require('./populate-api-test-data');


describe('GET count api', async function () {
    var new_token_with_access;
    var user;
    before(async () => {
      new_token_with_access = await getTokenForUser();
      user = await getUser();
    })
    it('should contain correct response data', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/beacons/count?property=${property}`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(200)
            .then(response => {
              assert.isAbove(response.body.count , 0 , `Count is: ${response.body.count}`);
            done();
            })
            .catch((e)=> done(e))
     });


    it('Unauthorized error when invalid token sent', function(done) {
        var token = [null, "G@YDGywgeygfefuhuey"];
        const property = user.organisation.properties[1];
        const total = token.length;
        var current = 0;
        token.forEach(function(value) {
          api.get(`/api/beacons/count?property=${property}`)
            .set('Accept', 'application/json')
            .set('x-auth-token',value)
            .then(response => {
              assert.equal(response.status, 401, `Response is: ${response.status} when 401 expected`);
              current += 1;
              if (current == total ) {
               done();
              }
            })
            .catch((e)=> {
            console.log("test failed with:", e)
            })
          })
     });

    it('Bad request when invalid property value passed', function(done) {
        var property_values = [ null, "abc%^&%^_!@@", -123];
        const total = property_values.length;
        var current = 0;
        property_values.forEach(function(value) {
          api.get(`/api/beacons/count?property=${value}`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .then(response => {
              assert.equal(response.status, 400, `Response is: ${response.status} when 400 expected`);
              current += 1;
              if (current == total ) {
               done();
              }
            })
            .catch((e)=> {
            console.log("test failed with:", e)
            })
        })
     });
});