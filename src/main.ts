import * as dotenv from 'dotenv';
dotenv.config();

import bot from './boundaries/bot';
import httpServer from './boundaries/http-server';

async function start() {
  await httpServer.start();
  await bot.start();
}

start();
