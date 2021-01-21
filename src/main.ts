import * as dotenv from 'dotenv';
import pgMainnet from './boundaries/db-mainnet';
import pgPyrmont from './boundaries/db-pyrmont';
import httpServer from './boundaries/http-server';
import bot from './boundaries/bot';

async function start () {
  dotenv.config();
  await pgMainnet.start();
  await pgPyrmont.start();
  await httpServer.start();
  await bot.start();
}

start();
