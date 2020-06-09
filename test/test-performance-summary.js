var should = require('chai').should(),
    expect = require('chai').expect,
    assert = require('chai').assert,
    supertest = require('supertest'),
    api = supertest('http://localhost:8181');
const { getTokenForUser, getUser} = require('./populate-api-test-data');

describe('GET performance api', function () {
    var new_token_with_access;
    var user;

    before(async () => {
      new_token_with_access = await getTokenForUser();
      user = await getUser();
    })

    it('returns the distributions with the same keys', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/performance/summary?property=${property}&percentile=99&metric=dom_interactive`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
                const bouncingTimes = Object.keys(response.body.bouncingDistribution);
                const nonBouncingTimes = Object.keys(response.body.nonBouncingDistribution);
                bouncingTimes.forEach((t, index) => {
                    assert.equal(t, nonBouncingTimes[index]);
                })
                
            done();
            })
            .catch((e)=> done(e))
    });

    it('valid response returned when property, percentile, and metric values are passed', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/performance/summary?property=${property}&percentile=80&metric=page_load`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
              assert.isDefined(response.body.bouncingDistribution, "bouncingDistribution object is NULL");
              assert.isDefined(response.body.nonBouncingDistribution, "nonBouncingDistribution object is NULL");
            done();
            })
            .catch((e)=> done(e))
     });

    it('Bad request error when only percentile and metric parameter passed', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/performance/summary?percentile=80&metric=page_load`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(400)
            .then(() => done())
            .catch((e)=> done(e))
     });

    it('Bad request error when only property and metric parameter passed', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/performance/summary?property=${property}&metric=page_load`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(400)
            .then(() => done())
            .catch((e)=> done(e))
     });

     it('Bad request error when only property and percentile parameter passed', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/performance/summary?property=${property}&percentile=80`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(400)
            .then(() => done())
            .catch((e)=> done(e))
     });

    it('Bad request error when neither property or percentile parameters passed ', function(done) {
        api.get(`/api/performance/summary`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(400)
            .then(() => done())
            .catch((e)=> done(e))
     });

     it('Bad request error when metric is not valid', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/performance/summary?property=${property}&percentile=80&metric=farp`)
            .set('Accept', 'application/json')
            .set('x-auth-token',new_token_with_access)
            .expect(400)
            .then(() => done())
            .catch((e)=> done(e))
     });

    it('Unauthorized error when invalid token set', function(done) {
        const property = user.organisation.properties[1];
        api.get(`/api/performance/summary?property=${property}`)
            .set('Accept', 'application/json')
            .set('x-auth-token',"bahjsd67wqieyfqd999")
            .expect(401)
            .then(() => done())
            .catch((e)=> done(e))
     });
});

