import validatorsApi from '../api/validators';
import organizationsApi from '../api/organizations';
import msgHeader from '../helpers/msg-header';
import { Command } from './decorators/command-decorator';
import { Schedule } from './decorators/schedule-decorator';
import AttestationRate from './attestation-rate';
import Effectiveness from './effectiveness';
import bot from '../boundaries/bot';
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
    return outputString;
  };

  static async createPublicEmbedMessage(data) {
    const { validators } = data;
    const showStatuses = ['active', 'deposited'];
    const { mainnet } = validators;
    return {
      ...msgHeader,
      title: ':bell: Daily BloxStaking Updates',
      fields: [
        {
          name: ':cut_of_meat: Mainnet Validators :cut_of_meat:',
          value: ':point_down: '
        },
        ...Object.keys(mainnet).filter(key => showStatuses.includes(key))
          .reduce((aggr, key) => {
            const name = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            aggr.push({
              name,
              value: mainnet[key],
              inline: true
            });
            return aggr;
          }, []),
        {
          name: ':bar_chart: Stats [last 300 epoch] :bar_chart:',
          value: ':point_down: '
        },
        {
          name: 'Attestation',
          value: await AttestationRate.getRate({ justValue: true }),
          inline: true
        },
        {
          name: 'Effectiveness',
          value: await Effectiveness.getEff({ justValue: true }),
          inline: true
        },
      ],
    };
  };

  @Schedule({
    cron: '0 3,15 * * *',
    channelId: process.env.PUBLIC_STATS_CHANNEL_ID,
    env: 'prod'
  })
  static async getPublicStats() {
    const validators = await this.loadValidatorsData();
    const users = await this.loadUsersData();
    const outputString = await this.createPublicEmbedMessage({ ...validators, users });
    return outputString;
  };
}
