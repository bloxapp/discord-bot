import * as dotenv from 'dotenv';
dotenv.config();

import pgMainnet from './boundaries/db-mainnet';
import pgPyrmont from './boundaries/db-pyrmont';
import httpServer from './boundaries/http-server';
import bot from './boundaries/bot';

async function start () {
  await pgMainnet.start();
  await pgPyrmont.start();
  await httpServer.start();
  await bot.start();
}

start();
