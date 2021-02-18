import validatorsApi from '../api/validators';
import organizationsApi from '../api/organizations';
import msgHeader from '../helpers/msg-header';
import { Command } from './decorators/command-decorator';
import { Schedule } from './decorators/schedule-decorator';
import AttestationRate from './attestation-rate';
import Effectiveness from './effectiveness';
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
    const { mainnet, pyrmont } = validators;
    console.log(1);
    const attrMainnet = await AttestationRate.getRate({ network: 'mainnet', justValue: true });
    const effMainnet = await Effectiveness.getEff({ network: 'mainnet', justValue: true });
    console.log(2);
    const attrPyrmont = await AttestationRate.getRate({ network: 'pyrmont', justValue: true });
    const effPyrmont = await Effectiveness.getEff({ network: 'pyrmont', justValue: true });
    console.log(3);
    return {
      ...msgHeader,
      title: ':bell: Daily BloxStaking Updates',
      fields: [
        {
          name: ':cut_of_meat: Mainnet Validators :cut_of_meat:',
          value: '-------------------------------'
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
          value: `${Number(attrMainnet).toFixed(3)}%`,
          inline: true
        },
        {
          name: 'Effectiveness',
          value: `${Number(effMainnet).toFixed(3)}%`,
          inline: true
        },

        {
          name: ':cut_of_meat: Pyrmont Validators :cut_of_meat:',
          value: '-------------------------------'
        },
        ...Object.keys(pyrmont).filter(key => showStatuses.includes(key))
          .reduce((aggr, key) => {
            const name = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            aggr.push({
              name,
              value: pyrmont[key],
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
          value: `${Number(attrPyrmont).toFixed(3)}%`,
          inline: true
        },
        {
          name: 'Effectiveness',
          value: `${Number(effPyrmont).toFixed(3)}%`,
          inline: true
        },

      ],
    };
  };

  @Schedule({
    cron: '0 11 * * *',
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
