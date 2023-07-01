import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';
import { fork } from 'child_process';

const port = process.env.START_PORT!;

if (cluster.isPrimary) {

  const dbProcess = fork('./src/databaseProcess.ts');

  console.log(`Primary ${process.pid} is running`);
  const AP = availableParallelism();
  for (let i = 0; i < AP; i++) {
    cluster.fork();
    dbProcess.send(Math.random())
  }
} else {
  console.log(`Worker ${process.pid} started`);
}
