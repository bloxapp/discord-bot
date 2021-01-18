const Discord = require('discord.js');
const loadProcessStatistics = require('../commands/process-statistics');
const loadNewValidators = require('../commands/new-validators');
const { getRate, getAvgRate } = require('../commands/attestation-rate');
const { getEff, getAvgEff } = require('../commands/effectiveness');
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
  cron.schedule(`*/${validatorsPeriodMin} * * * *`, async() => {
    emitMessage(await loadNewValidators({ network: 'pyrmont', type: 'active', periodInMin: validatorsPeriodMin }));
    emitMessage(await loadNewValidators({ network: 'pyrmont', type: 'deposit', periodInMin: validatorsPeriodMin }));
    emitMessage(await loadNewValidators({ network: 'mainnet', type: 'active', periodInMin: validatorsPeriodMin }));
    emitMessage(await loadNewValidators({ network: 'mainnet', type: 'deposit', periodInMin: validatorsPeriodMin }));
  });
  cron.schedule('0 6,18 * * *', async() => {
    emitMessage(await loadProcessStatistics());
    emitMessage(await getRate('pyrmont'));
    emitMessage(await getEff('pyrmont'));
    emitMessage(await getAvgRate('pyrmont'));
    emitMessage(await getAvgEff('pyrmont'));
    emitMessage(await getRate('mainnet'));
    emitMessage(await getEff('mainnet'));
    emitMessage(await getAvgRate('mainnet'));
    emitMessage(await getAvgEff('mainnet'));
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
      name: 'New validators for pyrmont [param: minutes, default last hour]',
      cmd: '!n.v.p'
    },
    {
      name: 'New validators for mainnet [param: minutes, default last hour]',
      cmd: '!n.v'
    },
    {
      name: 'Attestations rate for pyrmont [param: epoch diff, default 300]',
      cmd: '!attr.p'
    },
    {
      name: 'Attestations rate for mainnet [param: epoch diff, default 300]',
      cmd: '!attr'
    },
    {
      name: 'Effectiveness for pyrmont [param: epoch diff, default 300]',
      cmd: '!eff.p'
    },
    {
      name: 'Effectiveness for mainnet [param: epoch diff, default 300]',
      cmd: '!eff'
    },
    {
      name: 'Avg attestations rate for mainnet [param: epoch diff, default 300]',
      cmd: '!attr.avg'
    },
    {
      name: 'Avg attestations rate for pyrmont [param: epoch diff, default 300]',
      cmd: '!attr.p.avg'
    },
    {
      name: 'Avg effectiveness for mainnet [param: epoch diff, default 300]',
      cmd: '!eff.avg'
    },
    {
      name: 'Avg effectiveness for pyrmont [param: epoch diff, default 300]',
      cmd: '!eff.p.avg'
    },
  ]
  const prefix = process.env.ENV === 'stage' ? '.s' : '';
  const allowCommands = commands.map(({ cmd }) => `${cmd}${prefix}`);
  const parts = message.content.split(' ');
  const [cmd] = parts;
  const params = parts.slice(1);
  const defaultValidatorTypes = ['deposit', 'active'];

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
        await (async () => {
          const [type] = params.filter(value => defaultValidatorTypes.includes(value));
          const [periodInMin] = params.filter(value => value !== type);
          embed = await loadNewValidators({ network: 'mainnet', type, periodInMin });  
        })()
        break;
      case '!n.v.p':
      case '!n.v.p.s':
        await (async () => {
          const [type] = params.filter(value => defaultValidatorTypes.includes(value));
          const [periodInMin] = params.filter(value => value !== type);
          embed = await loadNewValidators({ network: 'pyrmont', type, periodInMin });
        })();
        break;
      case '!attr.p':
      case '!attr.p.s':
          embed = await getRate('pyrmont', params[0]);
        break;
      case '!eff.p':
      case '!eff.p.s':
          embed = await getEff('pyrmont', params[0]);
        break;
      case '!attr':
      case '!attr.s':
          embed = await getRate('mainnet', params[0]);
        break;
      case '!eff':
      case '!eff.s':
        embed = await getEff('mainnet', params[0]);
        break;
      case '!attr.avg':
      case '!attr.avg.s':
          embed = await getAvgRate('mainnet', params[0]);
        break;
      case '!attr.p.avg':
      case '!attr.p.avg.s':
          embed = await getAvgRate('pyrmont', params[0]);
        break;
      case '!eff.avg':
      case '!eff.avg.s':
        embed = await getAvgEff('mainnet', params[0]);
        break;
      case '!eff.p.avg':
      case '!eff.p.avg.s':
        embed = await getAvgEff('pyrmont', params[0]);
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
