
var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  var thread_id;
  var thread1;
  var reply_id;

  suite('API ROUTING FOR /api/threads/:board', function () {

    suite('POST', function () {
      test('Post /api/threads/:board', (done) => {
        chai.request(server)
          .post('/api/threads/thunder41/')
          .send({ name: 'thunder41', delete_password: 'text', text: 'text' })
          .end((err, res) => {
            assert.equal(res.body, 'saved')
            done();
          })
      }).timeout(5000)
    });

    suite('GET', function () {

      test('Get /api/threads/:board', (done) => {
        chai.request(server)
          .get('/api/threads/thunder41/')
          .end((err, res) => {
            thread_id = res.body[0]._id;
            thread1 = res.body[1]._id;
            assert.notProperty(res.body[0], 'delete_password')
            assert.notProperty(res.body[0], 'reported')
            assert.property(res.body[0], '_id')
            assert.property(res.body[0], 'text')
            done();
          })
      });
    });

    suite('DELETE', function () {
      test('Get /api/threads/board', (done) => {
        chai.request(server)
          .delete('/api/threads/thunder41')
          .send({ 'delete_password': 'text', thread_id: thread_id })
          .end((err, res) => {
            assert.equal(res.body, 'success')
            done();
          });
      }).timeout(5000)
    });

    suite('PUT', function () {
      test('Get /api/threads/board', (done) => {
        chai.request(server)
          .put('/api/threads/thunder41')
          .send({ thread_id: thread1 })
          .end((err, res) => {
            assert.equal(res.body, 'reported')
            done();
          })
      }).timeout(5000)
    });


  });

  suite('API ROUTING FOR /api/replies/:board', function () {

    suite('POST', function () {
      test('Get /api/replies/board', (done) => {
        chai.request(server)
          .post('/api/replies/thunder41')
          .send({ text: 'text', thread_id: thread1 })
          .end((err, res) => {
            assert.isArray(res.body, 'reply must be an Array')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], '_id')
            assert.property(res.body[0], 'reported')
            done();
          })
      }).timeout(5000);
    });

    suite('GET', function () {
      test('Get /api/replies/board', (done) => {
        chai.request(server)
          .get('/api/replies/thunder41')
          .query({ thread_id: thread1 })
          .end((err, res) => {
            reply_id = res.body.replies[0]._id;
            assert.exists(res.body, 'response should not be null')
            assert.notProperty(res.body, 'delete_password')
            assert.notProperty(res.body.replies[0], 'delete_password')
            assert.notProperty(res.body.replies[0], 'reported')
            done();
          })
      }).timeout(3500);
    });

    suite('PUT', function () {
      test('Get /api/replies/:board', (done) => {
        chai.request(server)
          .put('/api/replies/thunder41')
          .send({ thread_id: thread1, reply_id: reply_id })
          .end((err, res) => {
            assert.equal(res.body, 'reported')
            done();
          })
      }).timeout(5000);
    });

    suite('DELETE', function () {
      test('delete /api/replies/board', (done) => {
        chai.request(server)
          .delete('/api/replies/thunder41')
          .send({ 'reply_id': reply_id, thread_id: thread1 })
          .end((err, res) => {
            assert.equal(res.body, 'success')
            done();
          });
      }).timeout(5000)
    });

  });

});
