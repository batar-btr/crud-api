const { fork } = require('node:child_process');
const port = process.env.START_PORT!;

const dbProcess = fork('./src/databaseProcess.ts');
const serverProcess = fork('./src/serverProcess.ts');

serverProcess.on('message', (data: any) => {
  dbProcess.send(data);
})

dbProcess.on('message', ((data: any) => {
  serverProcess.send(data);
}))

// process.on('SIGINT', () => {
//   server.close(() => process.exit());
// });



