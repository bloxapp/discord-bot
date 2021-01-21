import bloxchaApi from '../api/bloxcha';
import pgPyrmont from '../boundaries/db-pyrmont';
import pgMainnet from '../boundaries/db-mainnet';
import msgHeader from '../helpers/msg-header';
import { Command } from './decorators/command-decorator';

export default class Effectiveness {
  static async createEmbedMessage(network, { avrage, from, to }) {
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
  }
  
  static async createAvgEmbedMessage(network, summary) {
    return {
      ...msgHeader,
      title: `${network} avg effectiveness on ${process.env.ENV} `,
      fields: Object.keys(summary).map(key => ({ name: key, value: `validators: ${summary[key].validators}, avg: ${summary[key].avg}` }))
    };
  }
  
  @Command({
    cmd: 'eff',
    description: 'Effectiveness',
    args: ['network', 'customNumber']
  })
  static async getEff({ network = 'mainnet', customNumber = 300 }) {
    const stats = await bloxchaApi.loadStats(network);
    const { data: { epoch } } = stats;
    const db = network === 'pyrmont'
      ? pgPyrmont
      : pgMainnet;
    const from = epoch - customNumber;
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
    const outputString = this.createEmbedMessage(network, { avrage, from, to });
    return outputString;
  }
  
  
  @Command({
    cmd: 'eff.avg',
    description: 'Avg effectiveness',
    args: ['network', 'customNumber']
  })
  static async getAvgEff({ network = 'mainnet', customNumber = 300 }) {
    const stats = await bloxchaApi.loadStats(network);
    const { data: { epoch } } = stats;
    const db = network === 'pyrmont'
      ? pgPyrmont
      : pgMainnet;
    const from = epoch - customNumber;
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
    const outputString = this.createAvgEmbedMessage(network, summary);
    return outputString;
  }
}
