import validatorsApi from '../api/validators';
import msgHeader from '../helpers/msg-header';
import { Command } from './decorators/command-decorator';
import { Schedule } from './decorators/schedule-decorator';

export default class NewValidators {
  static async createEmbedMessage(type, validators, showPrefix = true) {
    return {
      ...msgHeader,
      title: ':clap: Congratulations! :clap:',
      fields: validators.map((validator) => {
        const { id, network, publicKey } = validator;
        const currentNetwork = network === 'mainnet' ? '' : `${network}.`;
        const value = `https://${currentNetwork}beaconcha.in/validator/${publicKey}`;
        let name;
        if (type === 'propose') {
          name = `Validator ${id} successfully proposed on the Beacon Chain`;
        } else if (type === 'deposit') {
          name = `Validator ${id} for officially joining the Beacon Chain`;
        } else {
          name = `New ${type} Validator id ${id}`;
        }
        return {
          name: showPrefix ?
            `[${process.env.ENV}: ${network}] ${name}`
            : name,
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
  static async getStats({ network = 'mainnet', type = 'active', customNumber = 60, justValue = false, showPrefix = true }) {
    const validators = await validatorsApi.loadNewValidators(network, type, customNumber);
    if (justValue) {
      return validators;
    }
    if (validators.length === 0) {
      return;
    }
    const outputString = this.createEmbedMessage(type, validators, showPrefix);
    return outputString;
  };

  @Schedule({
    cron: '* * * * *'
  })
  static async getSummaryStats({ periodInMin = 1 }) {
    const result = [
      await this.getStats({ network: 'prater', type: 'active', customNumber: periodInMin }),
      await this.getStats({ network: 'prater', type: 'deposit', customNumber: periodInMin }),
      await this.getStats({ network: 'mainnet', type: 'active', customNumber: periodInMin }),
      await this.getStats({ network: 'mainnet', type: 'deposit', customNumber: periodInMin })
    ].filter(item => item);
    if (result.length) {
      return result;
    }
  }

  @Schedule({
    cron: '* * * * *',
    channelId: process.env.PUBLIC_STATS_CHANNEL_ID,
    env: 'prod'
  })
  static async getPublicStats({ periodInMin = 1 }) {
    const network = 'mainnet';
    const result = [
      await this.getStats({ network, type: 'propose', customNumber: periodInMin, showPrefix: false }),
      await this.getStats({ network, type: 'deposit', customNumber: periodInMin, showPrefix: false })
    ].filter(item => item);
    if (result.length) {
      return result;
    }
  }
}
