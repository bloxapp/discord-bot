import validatorsApi from '../api/validators';
import organizationsApi from '../api/organizations';
import msgHeader from '../helpers/msg-header';
import { Command } from './decorators/command-decorator';
import { Schedule } from './decorators/schedule-decorator';

export default class ProcessStatistics {
  static async loadValidatorsData() {
    const wallets = await validatorsApi.loadWallets();
    const validators = await validatorsApi.loadValidators();
    return { wallets, validators };
  };

  static async loadUsersData() {
    const users = await organizationsApi.loadStats();
    return users;
  };

  static async createEmbedMessage(data) {
    const { wallets, validators, users } = data;
    let validatorsCount = 0;
    const validatorsKeys = ['active', 'deposited'];
    const { pyrmont, mainnet } = validators;
    for (const [key, value] of Object.entries(validators)) {
      if(validatorsKeys.includes(key)) {
        validatorsCount += Number(value);
      }    
    }
    return {
      ...msgHeader,
      title: `Statistics ${process.env.ENV}`,
      fields: [
        {
          name: 'Users',
          value: users.total,
        },
        {
          name: 'Wallets',
          value: '-------------------------'
        },
        ...Object.keys(wallets).reduce((aggr, key) => {
          const name = key === 'deprecated_version'
            ? 'Deprecated'
            : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          aggr.push({
            name,
            value: wallets[key],
            inline: true
          });
          return aggr;
        }, [{ name: 'Total', value: Object.values(wallets).reduce((a, b) => Number(a) + Number(b), 0), inline: true }]),
        {
          name: 'Pyrmont Validators',
          value: '-------------------------'
        },
        ...Object.keys(pyrmont).reduce((aggr, key) => {
          const name = key === 'unknown_status'
            ? 'Unknown'
            : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          aggr.push({
            name,
            value: pyrmont[key],
            inline: true
          });
          return aggr;
        }, []),
        {
          name: 'Mainnet Validators',
          value: '-------------------------'
        },
        ...Object.keys(mainnet).reduce((aggr, key) => {
          const name = key === 'unknown_status'
            ? 'Unknown'
            : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          aggr.push({
            name,
            value: mainnet[key],
            inline: true
          });
          return aggr;
        }, []),
      ],
    };
  };

  @Command({
    cmd: 'u.s',
    description: 'User statistics'
  })
  @Schedule({
    cron: '0 6,18 * * *'
  })
  static async getStats() {
    const validators = await this.loadValidatorsData();
    const users = await this.loadUsersData();
    const outputString = await this.createEmbedMessage({ ...validators, users });
    return [outputString];
  };
}
