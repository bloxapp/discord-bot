import e2m from '../api/e2m';
import { formatRate } from '../helpers/format';
import { createAverageRatesMessage, createStandardMessage } from '../helpers/message';
import { Command } from './decorators/command-decorator';

export default class AttestationRate {
  @Command({
    cmd: 'attr',
    description: 'Attestations rate',
    args: ['network', 'customNumber']
  })
  static async getRate({ network = 'mainnet', customNumber = 300, justValue = false }) {
    const resp = await e2m.getCumulativeStats(network, customNumber);
    return createStandardMessage(
      {
        network,
        title: 'Attestation Rate',
        fromEpoch: resp.FromEpoch,
        toEpoch: resp.ToEpoch
      },
      { name: 'Rate', value: formatRate(resp.Data.AttestationRate) }
    );
  }

  @Command({
    cmd: 'attr.avg',
    description: 'Average attestations rate',
    args: ['network', 'customNumber']
  })
  static async getAvgRate({ network = 'mainnet', customNumber = 300 }, justValue = false) {
    const resp = await e2m.getValidatorStats(network, customNumber);
    return createAverageRatesMessage(
      {
        network,
        title: 'Average Attestation Rate',
        fromEpoch: resp.FromEpoch,
        toEpoch: resp.ToEpoch
      },
      Object.values(resp.Data).map(validator => validator.AttestationRate),
    )
  }
}
