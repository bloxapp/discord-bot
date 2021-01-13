const bloxchaApi = require('../api/bloxcha');
const pgPyrmont = require('../boundaries/db-pyrmont');
const pgMainnet = require('../boundaries/db-mainnet');

const createEmbedMessage = async (network, { rate, from, to }) => {
  return {
    color: 0x32E0C4, 
    url: 'https://www.bloxstaking.com',
    title: `${network} attestation rate on ${process.env.ENV} `,
    thumbnail: {
      url: 'https://www.bloxstaking.com/wp-content/uploads/2020/04/Blox-Staking_logo_white.png',
    },
    fields: [
      {
        name: `Rate`,
        value: rate
      },
      {
        name: `Query`,
        value: `epoch > ${from} and epoch < ${to}`
      }
   ]
  };
};

const getRate = async (network, diff = 300) => {
  const stats = await bloxchaApi.loadStats(network);
  const { data: { epoch } } = stats;
  const db = network === 'pyrmont'
    ? pgPyrmont
    : pgMainnet;
  const from = epoch - diff;
  const to = epoch;
  console.log(`SELECT avg(status)*100 as rate
  FROM validators v
  left join attestation_assignments on attestation_assignments.validatorindex = v.validatorindex
  where epoch > ${from} and epoch < ${to};`);
  const { rate } = (await db.get().query(`SELECT avg(status)*100 as rate
    FROM validators v
    left join attestation_assignments on attestation_assignments.validatorindex = v.validatorindex
    where epoch > ${from} and epoch < ${to};`)
  ).rows[0];
  const outputString = createEmbedMessage(network, { rate, from, to });
  return outputString;
};

module.exports = getRate;