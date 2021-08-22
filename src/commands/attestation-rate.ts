import bloxchaApi from '../api/bloxcha';
import msgHeader from '../helpers/msg-header';
import pgPrater from '../boundaries/db-prater';
import pgMainnet from '../boundaries/db-mainnet';
import { Command } from './decorators/command-decorator';

export default class AttestationRate {
  static async createEmbedMessage(network, { rate, from, to }) {
    return {
      ...msgHeader,
      title: `${network} attestation rate on ${process.env.ENV} `,
      fields: [
        {
          name: `Rate`,
          value: `${rate}`
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
      title: `${network} avg attestation rate on ${process.env.ENV} `,
      fields: Object.keys(summary).map(key => ({ name: key, value: `validators: ${summary[key].validators}, avg: ${summary[key].avg}` }))
    };
  }

  @Command({
    cmd: 'attr',
    description: 'Attestations rate',
    args: ['network', 'customNumber']
  })
  static async getRate({ network = 'mainnet', customNumber = 300, justValue = false }) {
    const stats = await bloxchaApi.loadStats(network);
    const { data: { epoch } } = stats;
    const from = epoch - customNumber;
    const to = epoch;
    let rate;
    console.log(`test - ${network} - from - ${from} to ${to} custom - ${customNumber}`);
    if (network === 'prater') {
      const data = (await this.getAvgRate({ network, customNumber }, true)).reduce((aggr, item) => {
        const rate = +item.rate;
        if (rate === 0) {
          return aggr;
        }
        aggr.validators += 1;
        aggr.rate += +rate;
        return aggr;
      }, { validators: 0, rate: 0 });
      rate = data.rate / data.validators;
    } else {
      /*
      const db = network === 'prater'
        ? pgPrater
        : pgMainnet;
      */
      const db = pgMainnet;
      rate = (await db.get().query(`SELECT avg(attestation_assignments_p.status)*100 as rate
        FROM validators v
        left join attestation_assignments_p on attestation_assignments_p.validatorindex = v.validatorindex
        where epoch > ${from} and epoch < ${to};`)
      ).rows[0].rate;
    }
    if (justValue) {
      return rate;
    }
    const outputString = this.createEmbedMessage(network, { rate, from, to });
    return outputString;
  }

  @Command({
    cmd: 'attr.avg',
    description: 'Avg attestations rate',
    args: ['network', 'customNumber']
  })
  static async getAvgRate ({ network = 'mainnet', customNumber = 300 }, justValue = false) {
    const stats = await bloxchaApi.loadStats(network);
    const { data: { epoch } } = stats;
    const db = network === 'prater'
      ? pgPrater
      : pgMainnet;
    const from = epoch - customNumber;
    const to = epoch;
    const { rows } = await db.get().query(`SELECT v.validatorindex, avg(attestation_assignments_p.status)*100 as rate
      FROM validators v
      left join attestation_assignments_p on attestation_assignments_p.validatorindex = v.validatorindex
      where epoch >  ${from} and epoch < ${to}
      group by v.validatorindex
      order by rate;`);
    if (justValue) {
      return rows;
    }
    const summary = rows.reduce((aggr, item) => {
      const rate = +item.rate;
      let groupName;
      if (rate === 0) {
        groupName = '0%';
      } else if (rate > 0 && rate <= 90) {
        groupName = '>0% x <=90%';
      } else if (rate > 90 && rate < 100) {
        groupName = '>90% x < 100%';
      } else if (rate === 100) {
        groupName = '100%';
      }
      aggr[groupName] = aggr[groupName] || { validators: 0, avg: 0 };
      aggr[groupName].validators += 1;
      aggr[groupName].avg += +rate;
      return aggr;
    }, {});
    Object.keys(summary).forEach(key => {
      summary[key].avg = summary[key].avg / summary[key].validators;
    });
    const outputString = this.createAvgEmbedMessage(network, summary);
    return outputString;
  }
}
