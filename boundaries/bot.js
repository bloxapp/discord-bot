const Discord = require('discord.js');
const loadProcessStatistics = require('../commands/process-statistics');
const loadNewValidators = require('../commands/new-validators');
const loadRate = require('../commands/attestation-rate');
const loadEff = require('../commands/effectiveness');
const runPeriodicTask = require('../periodic-task');
const setHour = require('../helpers/set-hour');

let bot;

const emitMessage = async (func) => {
  const asyncFunc = await func();
  const channelId = process.env.ENV === 'stage'
    ? process.env.DEV_CHANNEL_ID
    : process.env.ALL_CHANNEL_ID;
  // bot.channels.get(channelId).send({ embed: asyncFunc });
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
  runPeriodicTask(emitMessage, [loadProcessStatistics], processStatisticsTimeConfig);
  runPeriodicTask(emitMessage, [await loadNewValidators('pyrmont')], newValidatorsTimeConfig);
};

const onMessage = async (message) => {
  const cmds = ['!u.s', '!u.s.s', '!n.v', '!n.v.s', '!attr.p', '!eff.p', '!attr', '!eff'];
  const [cmd, params] = message.content.split(' ');
  if (!cmds.includes(cmd)) {
    return;
  }
  try {
    let embed;
    await message.channel.startTyping();
    switch (cmd) {
      case '!u.s':
        embed = await loadProcessStatistics();
        break;
      case '!u.s.s':
        embed = await loadProcessStatistics(true);
        break;
      case '!n.v':
        embed = await loadNewValidators('pyrmont');
        break;
      case '!n.v.s':
        embed = await loadNewValidators('pyrmont');
        break;
      case '!attr.p':
        embed = await loadRate('pyrmont', params);
        break;
      case '!eff.p':
        embed = await loadEff('pyrmont', params);
        break;
      case '!attr':
        embed = await loadRate('mainnet', params);
        break;
      case '!eff':
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
