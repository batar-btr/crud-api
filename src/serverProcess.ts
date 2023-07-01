import customServer from './server.ts';

console.log('server process', process.pid)

const server = customServer()
server.listen(4040, () => console.log('Server run on 4040'));