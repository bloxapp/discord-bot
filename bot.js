const dotenv = require('dotenv');
const Discord = require('discord.js');
const { fetchMessage } = require('./usersData');
const runPeriodicTask = require('./periodicTask');

dotenv.config();
const bot = new Discord.Client();

bot.login(process.env.TOKEN);

const sendMessage = async (message) => {
  bot.channels.get(process.env.DEV_CHANNEL_ID).send({ embed: message });
}

const onReady = async () => {
  console.info(`Logged in as ${bot.user.username}!`);
  const message = await fetchMessage();
  runPeriodicTask(sendMessage, message);
};

const onMessage = async (message) => {
  if (message.content === '!usersUpdate') {
    const messageToSend = await fetchMessage();
    await message.reply({embed: messageToSend});
  }
};

bot.on('ready', onReady);

bot.on('message', onMessage);

exports.module = bot;