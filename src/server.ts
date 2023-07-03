import { createServer } from 'http';
import { checkUrl } from './utils/checkURL';
import { DBResponse } from './databaseProcess';

const customServer = () => createServer((req, res) => {
  try {
    const method = req.method!;
    const [, , , id] = req.url?.split('/')!;

    // if(Math.random() > 0.5) {
    //   throw new Error();
    // }
    // if you want check random server internal error to see code 500 uncomment this

    if (checkUrl(req.url!)) {
      if (method === 'GET') {
        process.send && process.send({ method, uuid: id })
      }
      if (method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          process.send && process.send({ method, data: JSON.parse(body) })
        })
        console.log('POST')
      }
      if (method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          process.send && process.send({ method, data: JSON.parse(body), uuid: id })
        })
      }
      if (method === 'DELETE') {
        process.send && process.send({ method, uuid: id })
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Invalid endpoint((!');
    }

    process.on('message', (response: DBResponse) => {
      res.writeHead(response.code, { 'Content-Type': 'Application/json' });
      const result = JSON.stringify(response.data || response.message);
      res.end(result);
    });
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
})


export default customServer;

