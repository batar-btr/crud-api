import 'dotenv/config';
import { fork } from 'child_process';
const port = process.env.START_PORT!;

const dbProcess = fork('./src/databaseProcess.ts');
const serverProcess = fork('./src/serverProcess.ts');

const [, first, second] = 'sfsdfsdf'.split('/');
console.log(first, second);


serverProcess.on('message', (data) => {
  dbProcess.send(data);
})

dbProcess.on('message', (data => {
  serverProcess.send(data);
}))

// process.on('SIGINT', () => {
//   server.close(() => process.exit());
// });



