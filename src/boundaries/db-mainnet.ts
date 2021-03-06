import { Pool } from 'pg';

let connection = null;

/**
 * @todo make connection inside this function
 * @return {Promise<void>}
 */
async function start () {
  connection = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE_MAINNET,
    password: process.env.PGPASSWORD
  });
  await connection.query('SELECT 1');
  console.info('Postgresql mainnet is connected correctly!');
}

function get () {
  if (!connection) {
    console.error('Postgresql mainnet is not connected! Connect it first.');
  }
  return connection;
}

async function query (...args) {
  try {
    await connection.query('SELECT 1');
  } catch (error) {
    console.error('Postgresql mainnet client lost connection. Trying to re-connect...');
    await start();
  }
  return connection.query(...args);
}

export default {
  start,
  query,
  get
};
