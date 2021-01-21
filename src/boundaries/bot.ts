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
  ProcessStatistics.getStats
];

console.log(`Total active handlers - ${activeHandlers.length}`)

const emitMessage = (data) => {
  if (!data) return;
  const channelId = process.env.ENV === 'stage'
    ? process.env.DEV_CHANNEL_ID
    : process.env.ALL_CHANNEL_ID;
  bot.channels.get(channelId).send({ embed: data });
}

const onReady = async () => {
  for (const scheduler of registeredSchedulers) {
    cron.schedule(scheduler.cron, async() => {
      const { func, target, args = {} } = scheduler;
      const items = await func.bind(target)(args);
      items.forEach(msg => emitMessage(msg));
    });
  }
  console.info(`Logged in as ${bot.user.username}!`);
};

const onMessage = async (message) => {
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
  const defaultNetworks = ['pyrmont', 'mainnet'];
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
    await message.channel.startTyping();
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
  await message.channel.stopTyping();
};

async function start () {
  bot = new Discord.Client();
  bot.login(process.env.TOKEN);
  bot.on('ready', onReady);
  bot.on('message', onMessage);
  console.info('Discord bot is connected correctly!');
}

export default {
  start
};
