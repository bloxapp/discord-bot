const validatorsApi = require('../api/validators');
const organizationsApi = require('../api/organizations');

const loadValidatorsData = async (isStage) => {
  const wallets = await validatorsApi.loadWallets(isStage);
  const validators = await validatorsApi.loadValidators(isStage);
  return { wallets, validators };
};

const loadUsersData = async (isStage) => {
  const users = await organizationsApi.loadStats(isStage);
  return users;
};

const createEmbedMessage = async (data, isStage) => {
  const { wallets, validators, users } = data;
  let validatorsCount = 0;
  const validatorsKeys = ['active', 'deposited'];
  for (const [key, value] of Object.entries(validators)) {
    if(validatorsKeys.includes(key)) {
      validatorsCount+= value;
    }    
  }
  return {
    color: 0x32E0C4, 
    url: 'https://www.bloxstaking.com',
    title: `Users update statistics ${isStage ? 'stage' : 'production'}`,
    thumbnail: {
      url: 'https://www.bloxstaking.com/wp-content/uploads/2020/04/Blox-Staking_logo_white.png',
    },
    fields: [
      {
        name: 'Total registered users',
        value: users.total,
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

const loadProcessStatistics = async (isStage) => {
  const validators = await loadValidatorsData(isStage);
  const users = await loadUsersData(isStage);
  const outputString = await createEmbedMessage({ ...validators, users }, isStage);
  return outputString;
};

module.exports = loadProcessStatistics;