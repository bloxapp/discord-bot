const Discord = require('discord.js');
const loadProcessStatistics = require('./commands/processStatistics');
const loadNewValidators = require('./commands/newValidators');
const runPeriodicTask = require('./periodicTask');
const setHour = require('./helpers/setHour');

const bot = new Discord.Client();

bot.login(process.env.TOKEN);

const emitMessage = async (func) => {
  const asyncFunc = await func();
  bot.channels.get(process.env.DEV_CHANNEL_ID).send({ embed: asyncFunc });
  // bot.channels.get(process.env.ALL_CHANNEL_ID).send({ embed: asyncFunc });
}

const processStatisticsTimeConfig = {
  start: setHour(),
  interval: 1000 * 60 * 60 * 12 // half day
};

const newValidatorsTimeConfig = {
  start: setHour(),
  interval: 1000 * 60 * 29 // 29 mins,
};

const loadNewTestnetValidatorsFromStage = async () => await loadNewValidators(true, 'pyrmont');

const onReady = async () => {
  console.info(`Logged in as ${bot.user.username}!`);
  runPeriodicTask(emitMessage, [loadProcessStatistics], processStatisticsTimeConfig);
  runPeriodicTask(emitMessage, [loadNewTestnetValidatorsFromStage], newValidatorsTimeConfig);
};

const onMessage = async (message) => { 
  let processStatistics;
  if (message.content === '!u.s') {
    processStatistics = await loadProcessStatistics();
    await message.reply({embed: processStatistics});
    return;
  }
  if (message.content === '!u.s.s') {
    processStatistics = await loadProcessStatistics(true);
    await message.reply({embed: processStatistics});
    return;
  }  
  if (message.content === '!new.validators') {
    const isStage = true;
    const newValidators = await loadNewValidators(isStage, 'pyrmont');
    await message.reply({embed: newValidators});
    return;
  }  
};

bot.on('ready', onReady);

bot.on('message', onMessage);

exports.module = bot;