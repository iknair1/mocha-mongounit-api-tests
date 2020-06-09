var should = require('chai').should(),
    expect = require('chai').expect,
    assert = require('chai').assert,
    supertest = require('supertest'),
    api = supertest('http://localhost:8181');
const {getTokenForUser, getTokenForUserWithNoSiteAccess, getUser} = require('./populate-api-test-data');


describe('GET properties api', function () {
    var new_token_with_access;
    var new_token_with_no_access;

    before(async () => {
      new_token_with_access = await getTokenForUser();
      new_token_with_no_access = await getTokenForUserWithNoSiteAccess();
    })

    it('user with no site access should see property list empty', function(done) {
        api.get('/api/properties')
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_no_access)
            .expect(200)
            .then(response => {
              assert.isEmpty(response.body.properties, `Looks like someone has access to sites: ${response.body.properties}`);
            done();
            })
            .catch((e)=> done(e))
    });

    it('user with site access should see only the property domains with beacons', function(done) {
        api.get('/api/properties')
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(200)
            .then(response => {
              assert.isNotEmpty(response.body.properties ,
               `Expected user to have access to site properties but looks like they have got none: ${response.body.properties}`);
              assert.equal(JSON.stringify(response.body.properties[0].domains), '["_ANY_"]',
               `First property has Incorrect domains ${JSON.stringify(response.body.properties[0].domains)}`);
            done();
            })
            .catch((e)=> done(e))
    });

    it('user with site access should see the correct property key', function(done) {
        api.get('/api/properties')
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(200)
            .then(response => {
              assert.equal(JSON.stringify(response.body.properties[0].key), '"111-111"',
               `First property has Incorrect key: ${JSON.stringify(response.body.properties[0].key)}`);
            done();
            })
            .catch((e)=> done(e))
    });

    it('if beacon list is empty then user does not see the domain ', function(done) {
        api.get('/api/properties')
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(200)
            .then(response => {
              assert.equal(response.body.properties.length, 1,
               `fwf has empty beacon list so we only see one property i.e. _any_. Length of the property: ${response.body.properties.length}`);
            done();
            })
            .catch((e)=> done(e))
    });
});