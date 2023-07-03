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
    console.log(data);
    console.log(worker.id);
    dbProcess.send({...data, workerId: worker.id});
  })

  dbProcess.on('message', ((data: any) => {
    const worker = workers?.[data.workerId];
    worker?.send(data);
  }))

  const loadBalancer = createServer((req, res) => {
    console.log(req)
  }).listen(port, () => console.log(`Loadbalancer on port: ${port}`));

  
} else {
  const serverPort = cluster.worker?.id! + +port;
  const server = customServer().listen(serverPort, () => console.log(`Server listen on: ${serverPort}`))
}
