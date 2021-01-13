const Discord = require('discord.js');
const loadProcessStatistics = require('../commands/process-statistics');
const loadNewValidators = require('../commands/new-validators');
const loadRate = require('../commands/attestation-rate');
const loadEff = require('../commands/effectiveness');
const cron = require('node-cron');

let bot;

const emitMessage = (data) => {
  if (!data) return;
  const channelId = process.env.ENV === 'stage'
    ? process.env.DEV_CHANNEL_ID
    : process.env.ALL_CHANNEL_ID;
  bot.channels.get(channelId).send({ embed: data });
}

const onReady = async () => {
  const validatorsPeriodMin = 1;
  console.info(`Logged in as ${bot.user.username}!`);
  cron.schedule(`*/${validatorsPeriodMin} * * * *`, async() => emitMessage(await loadNewValidators('pyrmont', validatorsPeriodMin)));
  cron.schedule(`*/${validatorsPeriodMin} * * * *`, async() => emitMessage(await loadNewValidators('mainnet', validatorsPeriodMin)));
  cron.schedule('0 8,20 * * *', async() => {
    emitMessage(await loadProcessStatistics());
    emitMessage(await loadRate('pyrmont'));
    emitMessage(await loadEff('pyrmont'));
    emitMessage(await loadRate('mainnet'));
    emitMessage(await loadEff('mainnet'));
  });
};

const onMessage = async (message) => {
  const isWrongChannel = ![process.env.ALL_CHANNEL_ID, process.env.DEV_CHANNEL_ID].includes(message.channel.id);
  const isStageAndNotDevChannel = process.env.ENV === 'stage' && message.channel.id !== process.env.DEV_CHANNEL_ID;
  if (isWrongChannel || isStageAndNotDevChannel) {
    return;
  }

  const commands = [
    {
      name: 'User statistics',
      cmd: '!u.s'
    },
    {
      name: 'New validator',
      cmd: '!n.v'
    },
    {
      name: 'Attestations rate for pyrmont',
      cmd: '!attr.p'
    },
    {
      name: 'Attestations rate for mainnet',
      cmd: '!attr'
    },
    {
      name: 'Effectiveness for pyrmont',
      cmd: '!eff.p'
    },
    {
      name: 'Effectiveness for mainnet',
      cmd: '!eff'
    }
  ]
  const prefix = process.env.ENV === 'stage' ? '.s' : '';
  const allowCommands = commands.map(({ cmd }) => `${cmd}${prefix}`);
  const [cmd, params] = message.content.split(' ');
  if (!allowCommands.includes(cmd) && cmd !== '!help') {
    return;
  }
  const isProdAndDevChannel = process.env.ENV !== 'stage' && message.channel.id === process.env.DEV_CHANNEL_ID;
  if (isProdAndDevChannel && cmd === '!help') {
    return;
  }

  try {
    let embed;
    await message.channel.startTyping();
    switch (cmd) {
      case '!help':
        embed = {
          title: `Commands`,
          fields: commands.map(item => ({
            name: item.name,
            value: `${item.cmd}${prefix ? ` - prod, ${item.cmd}${prefix} - stage`: ''}`
          }))
        };
        break;
      case '!u.s':
      case '!u.s.s':
        embed = await loadProcessStatistics();
        break;
      case '!n.v':
      case '!n.v.s':
        embed = await loadNewValidators('mainnet');
        break;
      case '!attr.p':
      case '!attr.p.s':
          embed = await loadRate('pyrmont', params);
        break;
      case '!eff.p':
      case '!eff.p.s':
          embed = await loadEff('pyrmont', params);
        break;
      case '!attr':
      case '!attr.s':
          embed = await loadRate('mainnet', params);
        break;
      case '!eff':
      case '!eff.s':
        embed = await loadEff('mainnet', params);
        break;
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

module.exports = {
  start
};
