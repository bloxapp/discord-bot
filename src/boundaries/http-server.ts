import * as express from "express";

async function start () {
  const app = express();
    return new Promise<void>((resolve, reject) => {
    app.listen(process.env.PORT, () => {
      console.info(`BloxStaking Discord Bot listening on ${process.env.PORT}`);
      resolve();
    }).once('error', reject);
  });
}

export default {
  start
};
