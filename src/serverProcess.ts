import customServer from './server';
require('dotenv').config();
const port = process.env.START_PORT! || 4040;

const server = customServer()
server.listen(port, () => console.log(`Server run on ${port}`));