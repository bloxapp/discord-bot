const bloxchaApi = require('../api/bloxcha');
const pgPyrmont = require('../boundaries/db-pyrmont');
const pgMainnet = require('../boundaries/db-mainnet');
const msgHeader = require('../helpers/msg-header');

const createEmbedMessage = async (network, { avrage, from, to }) => {
  return {
    ...msgHeader,
    title: `${network} effectiveness on ${process.env.ENV} `,
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


const createAvgEmbedMessage = async (network, summary) => {
  return {
    ...msgHeader,
    title: `${network} avg effectiveness on ${process.env.ENV} `,
    fields: Object.keys(summary).map(key => ({ name: key, value: `validators: ${summary[key].validators}, avg: ${summary[key].avg}` }))
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


const getAvgEff = async (network, diff = 300) => {
  const stats = await bloxchaApi.loadStats(network);
  const { data: { epoch } } = stats;
  const db = network === 'pyrmont'
    ? pgPyrmont
    : pgMainnet;
  const from = epoch - diff;
  const to = epoch;
  const { rows } = await db.get().query(`SELECT validatorindex,1 / COALESCE(AVG(1 + inclusionslot - COALESCE((SELECT MIN(slot)
    FROM
        blocks
    WHERE
        slot > attestation_assignments.attesterslot AND blocks.status IN ('1', '3')), 0)), 0) * 100 as avrage
    FROM
        attestation_assignments
    WHERE validatorindex in (
        select validators.validatorindex from validators
        )  AND inclusionslot > 0 and epoch > ${from} and epoch < ${to}
    group by validatorindex;`);
  const summary = rows.reduce((aggr, item) => {
    const avrage = +item.avrage;
    let groupName;
    if (avrage === 0) {
      groupName = '0%';
    } else if (avrage > 0 && avrage <= 90) {
      groupName = '>0% x <=90%';
    } else if (avrage > 90) {
      groupName = '>90%';
    }
    aggr[groupName] = aggr[groupName] || { validators: 0, avg: 0 };
    aggr[groupName].validators += 1;
    aggr[groupName].avg += +avrage;
    return aggr;
  }, {});
  Object.keys(summary).forEach(key => {
    summary[key].avg = summary[key].avg / summary[key].validators;
  });
  const outputString = createAvgEmbedMessage(network, summary);
  return outputString;
};

module.exports = {
  getEff,
  getAvgEff
};