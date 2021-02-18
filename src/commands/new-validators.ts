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
        const { id, network, publicKey } = validator;
        const currentNetwork = network === 'mainnet' ? '' : `${network}.`;
        const value = `https://${currentNetwork}beaconcha.in/validator/${publicKey}`;
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
  static async getStats({ network = 'mainnet', type = 'active', customNumber = 60, justValue = false }) {
    const validators = await validatorsApi.loadNewValidators(network, type, customNumber);
    if (justValue) {
      return validators;
    }
    if (validators.length === 0) {
      return;
    }
    const outputString = this.createEmbedMessage(network, type, validators);
    return outputString;
  };

  @Schedule({
    cron: '* * * * *'
  })
  static async getSummaryStats({ periodInMin = 1 }) {
    return [
      await this.getStats({ network: 'pyrmont', type: 'active', customNumber: periodInMin }),
      await this.getStats({ network: 'pyrmont', type: 'deposit', customNumber: periodInMin }),
      await this.getStats({ network: 'mainnet', type: 'active', customNumber: periodInMin }),
      await this.getStats({ network: 'mainnet', type: 'deposit', customNumber: periodInMin })
    ]
  }

  static async createPublicEmbedMessage(validators) {
    return {
      ...msgHeader,
      title: ':clap: Congrats! :clap:',
      fields: validators.map((validator) => {
        const { id, publicKey } = validator;
        const value = `https://beaconcha.in/validator/${publicKey}`;
        return {
          name: `Validator ${id} successfully proposed on the beacon chain.`,
          value
        }
      }),
    };
  };

  @Schedule({
    cron: '* * * * *',
    channelId: process.env.PUBLIC_STATS_CHANNEL_ID,
    env: 'prod'
  })
  static async getPublicStats({ periodInMin = 1 }) {
    const network = 'mainnet';
    const validators = await this.getStats({ network, type: 'deposit', customNumber: periodInMin, justValue: true });
    if (Array.isArray(validators) && validators.length > 0) {
      const outputString = await this.createPublicEmbedMessage(validators);
      return outputString;
    }
  }
}
