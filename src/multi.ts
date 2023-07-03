import cluster from 'node:cluster';
import http, { createServer } from 'node:http';
require('dotenv').config();
import { availableParallelism } from 'node:os';
import process from 'node:process';
import { fork } from 'child_process';
import customServer from './server';

const port = process.env.START_PORT!;

if (cluster.isPrimary) {

  const dbProcess = fork('./src/databaseProcess.ts');

  const AP = availableParallelism() - 1;

  for (let i = 0; i < AP; i++) {
    cluster.fork();
  }
  const workers = cluster.workers;

  cluster.on('message', (worker, data) => {
    dbProcess.send({ ...data, workerId: worker.id });
  })

  dbProcess.on('message', ((data: any) => {
    const worker = workers?.[data.workerId];
    worker?.send(data);
  }))

  let currentWorkerId = AP - 1;

  const loadBalancer = createServer((req, res) => {


    currentWorkerId = ((currentWorkerId + 1) % AP);
    const options = {
      method: req.method,
      headers: req.headers,
    }
    const redirectUrl = `http://localhost:${+port + currentWorkerId + 1}/api/users`;
    console.log(`Load balancer redirect reques to: ${redirectUrl}`);

    const proxyReq = http.request(redirectUrl, options, proxyRes => {
      res.writeHead(proxyRes.statusCode!, proxyRes.headers);
      proxyRes.pipe(res);
    })
    req.pipe(proxyReq);

  }).listen(port, () => console.log(`Loadbalancer on port: ${port}`));


} else {
  const serverPort = cluster.worker?.id! + +port;
  const server = customServer().listen(serverPort, () => console.log(`Server listen on: ${serverPort}`))
}
