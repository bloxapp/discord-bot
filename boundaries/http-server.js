const cors = require('cors');
const app = require('express')();
const { createServer } = require('http');
const httpServer = createServer(app);

app.use(cors());

async function start () {
  return new Promise((resolve, reject) => {
    if (httpServer.listening) return reject(new Error('HTTP Server is already listening'));
    httpServer.listen(process.env.PORT, () => {
      console.info(`BloxStaking Discord Bot listening on ${process.env.PORT}`);
      resolve();
    }).once('error', reject);
  });
}

module.exports = {
  httpServer,
  start
};
