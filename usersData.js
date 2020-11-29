const api = require('./api');

const loadUsersData = async () => {
  const wallets = await api.getWallets();
  const validators = await api.getValidators();
  return { wallets, validators };
};

const createEmbedMessage = async (data) => {
  const { wallets, validators } = data;

  let validatorsCount = 0;
  for (const [key, value] of Object.entries(validators)) {
    validatorsCount+= value;
  }

  return {
    color: 0x32E0C4, 
    url: 'https://discord.js.org',
    title: 'Users data update',
    thumbnail: {
      url: 'https://www.bloxstaking.com/wp-content/uploads/2020/04/Blox-Staking_logo_white.png',
    },
    fields: [
      {
        name: 'Total registered users',
        value: 'N/A',
      },
      {
        name: 'Total wallets',
        value: wallets.active + wallets.disabled + wallets.offline,
      },
      {
        name: 'Offline wallets',
        value: wallets.offline,
      },
      {
        name: 'Total validators',
        value: validatorsCount,
      },                  
    ],
  };
};

const fetchMessage = async () => {
  const result = await loadUsersData();
  const outputString = await createEmbedMessage(result);
  return outputString;
};

module.exports = {
  fetchMessage
};