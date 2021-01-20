const dotenv = require('dotenv');
const pgMainnet = require('./boundaries/db-mainnet');
const pgPyrmont = require('./boundaries/db-pyrmont');
const httpServer = require('./boundaries/http-server');
const bot = require('./boundaries/bot');

dotenv.config();

async function start () {
  await pgMainnet.start();
  await pgPyrmont.start();
  await httpServer.start();
  await bot.start();
}

start();
