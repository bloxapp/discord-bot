import validatorsApi from '../api/validators';
import msgHeader from '../helpers/msg-header';
import { Command } from './decorators/command-decorator';
import { Schedule } from './decorators/schedule-decorator';

export default class NewValidators {
  static async createEmbedMessage(network, type, validators) {
    return {
      ...msgHeader,
      title: `New ${network} ${type} validators on ${process.env.ENV}`,
      fields: validators.map((validator) => {
        const { id, network } = validator;
        const currentNetwork = network === 'mainnet' ? '' : `${network}.`;
        const value = `https://${currentNetwork}beaconcha.in/validator/${validator.publicKey}`;
        return {
          name: `Validator id ${id}`,
          value
        }
      }),
    };
  };
  
  @Command({
    cmd: 'n.v',
    description: 'New validators',
    args: ['network', 'validator', 'customNumber']
  })
  static async getStats({ network = 'mainnet', validator = 'active', customNumber = 60 }) {
    const validators = await validatorsApi.loadNewValidators(network, validator, customNumber);
    if (validators.length === 0) {
      return;
    }
    const outputString = this.createEmbedMessage(network, validator, validators);
    return outputString;
  };

  @Schedule({
    cron: '*/1 * * * *'
  })
  static async getSummaryStats({ periodInMin = 1 }) {
    return [
      await this.getStats({ network: 'pyrmont', validator: 'active', customNumber: periodInMin }),
      await this.getStats({ network: 'pyrmont', validator: 'deposit', customNumber: periodInMin }),
      await this.getStats({ network: 'mainnet', validator: 'active', customNumber: periodInMin }),
      await this.getStats({ network: 'mainnet', validator: 'deposit', customNumber: periodInMin })
    ]
  }
}
