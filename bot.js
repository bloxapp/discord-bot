const Discord = require('discord.js');
const loadProcessStatistics = require('./commands/processStatistics');
const runPeriodicTask = require('./periodicTask');

const bot = new Discord.Client();

bot.login(process.env.TOKEN);

const sendMessage = async (message) => {
  bot.channels.get(process.env.DEV_CHANNEL_ID).send({ embed: message });
}

const onReady = async () => {
  console.info(`Logged in as ${bot.user.username}!`);
  const message = await loadProcessStatistics();
  runPeriodicTask(sendMessage, message);
};

const onMessage = async (message) => { 
  let messageToSend;
  if (message.content === 'u.s') {
    messageToSend = await loadProcessStatistics();
    await message.reply({embed: messageToSend});
    return;
  }
  if (message.content === 'u.s.s') {
    messageToSend = await loadProcessStatistics(true);
    await message.reply({embed: messageToSend});
    return;
  }  
};

bot.on('ready', onReady);

bot.on('message', onMessage);

exports.module = bot;