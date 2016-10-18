'use strict';
//set env vars?
process.env.APP_SECRET = process.env.APP_SECRET || 'mysecret';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/test';
//npm modules
const expect = require('chai').expect;
const request = require('superagent-use')(require('superagent'));
const superPromise = require('superagent-promise-plugin');
const debug = require('debug')('authdemo:auth-router-test');
//app modules
const itemController = require('../controller/item-controller');
const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller');
//module constants
const port = process.env.PORT || 3000;
const baseURL = `localhost:${port}/api`;
const server = require('../server');

request.use(superPromise);

describe('testing module auth-router', () => {
  before((done) => {
    debug('before module auth-router');
    if(!server.isRunning){
      server.listen(port, () => {
        server.isRunning = true;
        debug(`server UP <3 ${port}`);
        done();
      });
      return;
    }
    done();
  });
  after((done) => {
    debug('after module auth-router');
    if(server.isRunning){
      server.close(() => {
        server.isRunning = false;
        debug('server DOWN');
        done();
      });
      return;
    }
    done();
  });

  describe('testing module item router', function(){
    beforeEach((done) => {
      authController.signup({username: 'nana', password: 'yoyo'})
      .then( token => this.tempToken = token)
      .then( () => done())
      .catch(done);
    });
    afterEach((done) => {
      Promise.all([
        userController.removeAllUsers(),
        itemController.removeAllItems()
      ])
      .then(() => done())
      .catch(done);
    });

    describe('testing POST /api/item', () => {
      it('should return a item', (done) => {
        request.post(`${baseURL}/item`)
        .send({
          name: 'today',
          permission: false,
          records: ['stormy', 'saturday']
        })
        .set({//for headers
          authorization: `Bearer ${this.tempToken}`
        })
        .then( res => {
          expect(res.status).to.equal(200);
          // console.log(req.body);
          // expect(res.text.length).to.equal(205);
          done();
        })
        .catch(done);
      });
    });
  });

  describe('GET api/signin', function(){
    after((done) => {
      debug('after GET /api/signup');
      authController.removeAllUsers()
      .then(() => done())
      .catch(done);
    });
    before((done) => {
      debug('before GET /api/signup');
      authController.signup({username: 'testuser', password: 'yadayada123'})
      .then(() => done())
      .catch(done);
    });

    it('should return an token', (done) => {
      debug('test GET /api/signin');
      request.get(`${baseURL}/signin`)
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.text.length).to.equal(205);
        done();
      })
      .catch(done);
    });
  });

});
