import * as dotenv from 'dotenv';
dotenv.config();

import bot from './boundaries/bot';
import pgPrater from './boundaries/db-prater';
import pgMainnet from './boundaries/db-mainnet';
import httpServer from './boundaries/http-server';

async function start () {
  await pgPrater.start();
  await pgMainnet.start();
  await httpServer.start();
  await bot.start();
}

start();
