import * as cron from 'node-cron';
import * as Discord from 'discord.js';
import AttestationRate from '../commands/attestation-rate';
import Effectiveness from '../commands/effectiveness';
import NewValidators from '../commands/new-validators';
import ProcessStatistics from '../commands/process-statistics';

import { registeredCommands } from '../commands/decorators/command-decorator';
import { registeredSchedulers } from '../commands/decorators/schedule-decorator';

let bot;

const activeHandlers = [
  AttestationRate.getRate,
  AttestationRate.getAvgRate,
  Effectiveness.getEff,
  Effectiveness.getAvgEff,
  NewValidators.getStats,
  NewValidators.getPublicStats,
  // daily stats are disabled because they aren't accurate at the moment.
  // ProcessStatistics.getStats,
  ProcessStatistics.getPublicStats
];

console.log(`Total active handlers - ${activeHandlers.length}`)

const emitMessage = (data, customChannelId = null) => {
  if (!data) return;
  const channelId = process.env.ENV === 'stage'
    ? process.env.DEV_CHANNEL_ID
    : process.env.ALL_CHANNEL_ID;
  bot.channels.cache.get(customChannelId || channelId).send({ embed: data });
}

let isSetup = false;
const onReady = async () => {
  if (isSetup) return;

  const envSchedulers = registeredSchedulers.filter(scheduler => !scheduler.env || scheduler.env === process.env.ENV);
  for (const scheduler of envSchedulers) {
    cron.schedule(scheduler.cron, async () => {
      const { func, target, args = {} } = scheduler;
      const result = await func.bind(target)(args);
      const messages = Array.isArray(result) ? result : [result];
      messages.forEach(msg => emitMessage(msg, scheduler.channelId));
    });
  }
  isSetup = true;
  console.info(`Logged in as ${bot.user.username}!`);
};

const onMessage = async (message: Discord.Message) => {
  const isWrongChannel = ![process.env.ALL_CHANNEL_ID, process.env.DEV_CHANNEL_ID].includes(message.channel.id);
  const isStageAndNotDevChannel = process.env.ENV === 'stage' && message.channel.id !== process.env.DEV_CHANNEL_ID;
  if (isWrongChannel || isStageAndNotDevChannel) {
    return;
  }
  const parts = message.content.replace('!', '').split(' ');
  const [cmd] = parts;
  const params = parts.slice(1);

  const isCommandExists = registeredCommands.map(({ cmd }) => cmd).includes(cmd);
  if (!isCommandExists && cmd !== 'help') {
    return;
  }

  console.warn(`cmd: ${cmd} params ${params}`);

  const defaultValidatorTypes = ['deposit', 'active'];
  const defaultNetworks = ['prater', 'mainnet'];
  const defaultEnvs = ['stage', 'prod'];
  const query = {
    'validator': params.filter(value => defaultValidatorTypes.includes(value))[0],
    'network': params.filter(value => defaultNetworks.includes(value))[0],
    'customNumber': params.filter(value => `${+value}` === value)[0],
    'env': params.filter(value => defaultEnvs.includes(value))[0],
  }

  const isDevChannelAndEnvNotDefined = !query['env'] && process.env.DEV_CHANNEL_ID === message.channel.id;
  if (isDevChannelAndEnvNotDefined && process.env.ENV !== 'stage') {
    return;
  }

  if (query['env'] && query['env'] !== process.env.ENV) {
    return;
  }

  try {
    let embed;
    message.channel.startTyping();
    if (cmd === 'help') {
      embed = {
        title: `Commands`,
        fields: registeredCommands.map(item => ({
          name: item.description,
          value: `!${item.cmd}`
        }))
      };
    } else {
      const { func, target, args = [] } = registeredCommands.find(item => item.cmd === cmd);
      const params = Object.keys(query).reduce((result, key) => {
        if (!args.includes(key)) return result;
        result[key] = query[key];
        return result;
      }, {});
      embed = await func.bind(target)(params);
    }
    await message.reply({ embed });
  } catch (e) {
    console.error(`${cmd} failed:`, e);
  }
  message.channel.stopTyping();
};

async function start() {
  bot = new Discord.Client();
  bot.login(process.env.TOKEN);
  bot.on('ready', onReady);
  bot.on('message', onMessage);
  bot.on('error', error => console.error('error from Discord.Client', error));
  console.info('Discord bot is connected correctly!');
}

export default {
  start,
  emitMessage
};
