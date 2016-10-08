'use strict';
//override the process.env.MONGO_URI;
process.env.MONGO_URI = 'mongodb://localhost/test';

const expect = require('chai').expect;
const request = require('superagent-use');
const superPromise = require('superagent-promise-plugin');
const port = process.env.PORT || 3000;
const baseUrl = `http://localhost:${port}`;
const server = require('../server');
const itemCrud = require('../lib/item-crud');
request.use(superPromise);

describe('testing module item-crud', function(){
  before((done) => {
    if(!server.isRunning){
      server.listen(port, () => {
        server.isRunning = true;
        console.log('server UP @ ', port);
        done();
      });
      return;
    }
    done();
  });
  after((done) => {
    if(server.isRunning){
      server.close(() => {
        server.isRunning = false;
        console.log('server DOWN ');
        done();
      });
      return;
    }
    done();
  });

  describe('POST api/item with valid info', function(){
    after((done) => {
      itemCrud.removeAllItems()
      .then(() => done())
      .catch(done);
    });

    it('should return an item', function(done){
      request.post(`${baseUrl}/api/item`)
      .send({name: 'test item', records: 'yada yada'})
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal('test item');
        done();
      })
      .catch(done);
    });
  });
  describe('GET api/item with valid info', function(){
    after((done) => {
      itemCrud.removeAllItems()
      .then(() => done())
      .catch(done);
    });
    before((done) => {
      itemCrud.createItem({name: 'test item', records: 'yada yada 123'})
      .then(item => {
        this.tempItem = item;
        done();
      })
      .catch(done);
    });

    it('should return an item', (done) =>{
      request.get(`${baseUrl}/api/item/${this.tempItem._id}`)
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(this.tempItem.name);
        done();
      })
      .catch(done);
    });
  });
});
