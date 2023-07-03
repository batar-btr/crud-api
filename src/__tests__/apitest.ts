import http = require('http');
require('dotenv').config();
const { validate: isUuid } = require('uuid');

const PORT = process.env.START_PORT! || 4040;

const url = `http://localhost:${PORT}/api/users`

describe('Api test', () => {

  test('Get all records with a GET api/users:', (done) => {

    http.get(url, response => {
      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => {
        const res = JSON.parse(data);
        expect(Array.isArray(res)).toBeTruthy();
        expect(response.statusCode).toEqual(200);
        expect(res).toEqual([]);
        done()
      })
    })
  })

  test('Check invalid endpoint', done => {
    const invalidURL = `http://localhost:${PORT}/invalid/endpoint`;
    http.get(invalidURL, response => {
      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => {
        expect(response.statusCode).toEqual(404);
        expect(data).toEqual('Invalid endpoint((!');
        done()
      })
    })
  });

  test('Create new User, check valid uuid!!!', (done) => {

    const user = {
      username: 'John',
      age: 105,
      hobbies: ['whisky']
    }

    const request = http.request(url, {
      method: 'POST'
    }, (response) => {
      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => {
        const { id } = JSON.parse(data)
        expect(response.statusCode).toEqual(201);
        expect(id).toBeTruthy();
        expect(isUuid(id)).toBeTruthy();
        done()
      })
    });
    request.write(JSON.stringify(user));
    request.end();
  })
})