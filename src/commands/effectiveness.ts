import e2m from '../api/e2m';
import { formatRate } from '../helpers/format';
import { createAverageRatesMessage, createStandardMessage } from '../helpers/message';
import { Command } from './decorators/command-decorator';

export default class Effectiveness {
  @Command({
    cmd: 'eff',
    description: 'Effectiveness',
    args: ['network', 'customNumber']
  })
  static async getEff({ network = 'mainnet', customNumber = 300, justValue = false }) {
    const resp = await e2m.getCumulativeStats(network, customNumber);
    const effectiveness = resp.Data.Effectiveness;
    if (justValue) {
      return effectiveness;
    }
    return createStandardMessage(
      {
        network,
        title: 'Effectiveness',
        fromEpoch: resp.FromEpoch,
        toEpoch: resp.ToEpoch
      },
      { name: 'Rate', value: formatRate(effectiveness) }
    );
  }

  @Command({
    cmd: 'eff.avg',
    description: 'Average effectiveness',
    args: ['network', 'customNumber']
  })
  static async getAvgEff({ network = 'mainnet', customNumber = 300 }) {
    const resp = await e2m.getValidatorStats(network, customNumber);
    return createAverageRatesMessage(
      {
        network,
        title: 'Average Effectiveness',
        fromEpoch: resp.FromEpoch,
        toEpoch: resp.ToEpoch
      },
      Object.values(resp.Data).map(validator => validator.Effectiveness),
    )
  }
}
