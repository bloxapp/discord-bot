const bloxchaApi = require('../api/bloxcha');
const pgPyrmont = require('../boundaries/db-pyrmont');
const pgMainnet = require('../boundaries/db-mainnet');
const msgHeader = require('../helpers/msg-header');

const createEmbedMessage = async (network, { rate, from, to }) => {
  return {
    ...msgHeader,
    title: `${network} attestation rate on ${process.env.ENV} `,
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

const createAvgEmbedMessage = async (network, summary) => {
  return {
    ...msgHeader,
    title: `${network} avg attestation rate on ${process.env.ENV} `,
    fields: Object.keys(summary).map(key => ({ name: key, value: `validators: ${summary[key].validators}, avg: ${summary[key].avg}` }))
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
  const { rate } = (await db.get().query(`SELECT avg(status)*100 as rate
    FROM validators v
    left join attestation_assignments on attestation_assignments.validatorindex = v.validatorindex
    where epoch > ${from} and epoch < ${to};`)
  ).rows[0];
  const outputString = createEmbedMessage(network, { rate, from, to });
  return outputString;
};

const getAvgRate = async (network, diff = 300) => {
  const stats = await bloxchaApi.loadStats(network);
  const { data: { epoch } } = stats;
  const db = network === 'pyrmont'
    ? pgPyrmont
    : pgMainnet;
  const from = epoch - diff;
  const to = epoch;
  const { rows } = await db.get().query(`SELECT v.validatorindex, avg(status)*100 as rate
    FROM validators v
    left join attestation_assignments on attestation_assignments.validatorindex = v.validatorindex
    where epoch >  ${from} and epoch < ${to}
    group by v.validatorindex
    order by rate;`);
  const summary = rows.reduce((aggr, item) => {
    const rate = +item.rate;
    let groupName;
    if (rate === 0) {
      groupName = '0%';
    } else if (rate > 0 && rate <= 90) {
      groupName = '>0% x <=90%';
    } else if (rate > 90) {
      groupName = '>90%';
    }
    aggr[groupName] = aggr[groupName] || { validators: 0, avg: 0 };
    aggr[groupName].validators += 1;
    aggr[groupName].avg += +rate;
    return aggr;
  }, {});
  Object.keys(summary).forEach(key => {
    summary[key].avg = summary[key].avg / summary[key].validators;
  });
  const outputString = createAvgEmbedMessage(network, summary);
  return outputString;
};

module.exports = {
  getRate,
  getAvgRate
};