'use strict';
//set env vars?
process.env.APP_SECRET = process.env.APP_SECRET || 'my secret';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/test';
//npm modules
const expect = require('chai').expect;
const request = require('superagent-use')(require('superagent'));
const superPromise = require('superagent-promise-plugin');
const debug = require('debug')('authdemo:auth-router-test');
//app modules
const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller');
//module constants
const port = process.env.PORT || 3000;
const baseURL = `localhost:${port}/api`;
const server = require('../server.js');

request.use(superPromise);

describe('testing module auth-router', function(){
  before((done) => {
    debug('before module auth-router');
    if(!server.isRunning){
      server.listen(port, ()=> {
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

  describe('testing POST /api/signup', function(){
    after((done) => {
      debug('after POST /api/signup');
      userController.removeAllUsers()
      .then(() => done())
      .catch(done);
    });
    it('should return a token', (done) => {
      debug('test POST /api/signup');
      request.post(`${baseURL}/signup`)
      .send({
        username: 'stormy',
        password: 'saturday'
      })
      .then(res => {
        expect(res.status).to.equal(200);
        // console.log(res.text);
        // expect(res.text.length).to.equal(205);
        done();
      })
      .catch(done);
    });
  });

  describe('GET api/signin', function(){
    before((done) => {
      debug('before GET /api/signup');
      authController.signup({username: 'testuser', password: 'yadayada123'})
      .then(() => done())
      .catch(done);
    });
    after((done) => {
      debug('after GET /api/signup');
      authController.removeAllUsers()
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
