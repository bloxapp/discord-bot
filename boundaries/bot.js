const Discord = require('discord.js');
const loadProcessStatistics = require('../commands/process-statistics');
const loadNewValidators = require('../commands/new-validators');
const loadRate = require('../commands/attestation-rate');
const loadEff = require('../commands/effectiveness');
const runPeriodicTask = require('../periodic-task');
const setHour = require('../helpers/set-hour');

let bot;

const emitMessage = async (data) => {  // const asyncFunc = await func();
  const channelId = process.env.ENV === 'stage'
    ? process.env.DEV_CHANNEL_ID
    : process.env.ALL_CHANNEL_ID;
  bot.channels.get(channelId).send({ embed: data });
}

const processStatisticsTimeConfig = {
  start: setHour(),
  interval: 1000 * 60 * 60 * 12 // half day
};

const newValidatorsTimeConfig = {
  start: setHour(),
  interval: 1000 * 60 * 29 // 29 mins,
};

const onReady = async () => {
  console.info(`Logged in as ${bot.user.username}!`);
  runPeriodicTask(emitMessage, [await loadProcessStatistics()], processStatisticsTimeConfig);
  runPeriodicTask(emitMessage, [await loadNewValidators('pyrmont')], newValidatorsTimeConfig);
};

const onMessage = async (message) => {
  const isWrongChannel = ![process.env.ALL_CHANNEL_ID, process.env.DEV_CHANNEL_ID].includes(message.channel.id);
  const isStageAndNotDevChannel = process.env.ENV === 'stage' && message.channel.id !== process.env.DEV_CHANNEL_ID;
  if (isWrongChannel || isStageAndNotDevChannel) {
    return;
  }

  const defCommands = ['!u.s', '!n.v', '!attr.p', '!eff.p', '!attr', '!eff'];
  let allowCommands;
  if (process.env.ENV === 'stage') {
    allowCommands = defCommands.map(cmd => `${cmd}.s`);
  }

  const [cmd, params] = message.content.split(' ');
  if (!allowCommands.includes(cmd) && cmd !== '!help') {
    return;
  }

  try {
    let embed;
    await message.channel.startTyping();
    switch (cmd) {
      case '!help':
        embed = {
          title: `Help`,
          fields: [
            {
              name: `Commands`,
              value: defCommands.map(key => `${key}[.s]`).toString()
            }
          ]
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
