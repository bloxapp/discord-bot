const bloxchaApi = require('../api/bloxcha');
const pgPyrmont = require('../boundaries/db-pyrmont');
const pgMainnet = require('../boundaries/db-mainnet');

const createEmbedMessage = async (network, { avrage, from, to }) => {
  return {
    color: 0x32E0C4, 
    url: 'https://www.bloxstaking.com',
    title: `${network} effectiveness on ${process.env.ENV} `,
    thumbnail: {
      url: 'https://www.bloxstaking.com/wp-content/uploads/2020/04/Blox-Staking_logo_white.png',
    },
    fields: [
      {
        name: `Effectiveness`,
        value: avrage
      },
      {
        name: `Query`,
        value: `epoch > ${from} and epoch < ${to}`
      }
    ]
  };
};

const getEff = async (network, diff = 300) => {
  const stats = await bloxchaApi.loadStats(network);
  const { data: { epoch } } = stats;
  const db = network === 'pyrmont'
    ? pgPyrmont
    : pgMainnet;
  const from = epoch - diff;
  const to = epoch;
  const { avrage } = (await db.get().query(`SELECT 1 / COALESCE(AVG(1 + inclusionslot - COALESCE((SELECT MIN(slot)
    FROM
        blocks
    WHERE
        slot > attestation_assignments.attesterslot AND blocks.status IN ('1', '3')), 0)), 0) * 100 as avrage
    FROM
        attestation_assignments
    WHERE validatorindex in (
        select validators.validatorindex from validators
        )  AND inclusionslot > 0 and epoch > ${from} and epoch < ${to};`)
  ).rows[0];
  const outputString = createEmbedMessage(network, { avrage, from, to });
  return outputString;
};

module.exports = getEff;